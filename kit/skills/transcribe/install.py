#!/usr/bin/env python3
"""Installer for the transcribe skill (Windows build).

Idempotent: checks each piece, installs only what is missing, then proves
the whole pipeline with a real transcription. Safe to run twice.

    python install.py

What it sets up:
    1. yt-dlp (pip, if not already on PATH)
    2. faster-whisper (pip)
    3. cuBLAS + cuDNN (pip), only if an NVIDIA GPU is detected, this is what
       lets faster-whisper actually use it instead of silently falling back
       to CPU. Skipped entirely on a machine with no NVIDIA GPU.
    4. a `transcribe` command on PATH, at %USERPROFILE%\\.local\\bin
    5. the Whisper model weights (downloaded automatically on first run)

ffmpeg is a manual step (winget install Gyan.FFmpeg) since it is a binary,
not a Python package, and most machines already have it.
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent
BIN_DIR = Path.home() / ".local" / "bin"

# Prefer a known real interpreter over whatever happens to be first on PATH.
# On this kind of setup a project's own venv (an agent, a tool) can sit ahead
# of the system Python, and installing packages there instead of the real
# interpreter is a classic silent-failure trap.
PYTHON_CANDIDATES = [
    Path.home() / "AppData/Local/Microsoft/WindowsApps/python3.12.exe",
    Path(sys.executable),
]


def say(msg):
    print(f"\n==> {msg}")


def ok(msg):
    print(f"    ok: {msg}")


def fail(msg, hint=None):
    print(f"ERROR: {msg}", file=sys.stderr)
    if hint:
        print(hint, file=sys.stderr)
    sys.exit(1)


def find_python():
    for p in PYTHON_CANDIDATES:
        if p.is_file():
            return p
    fail("No usable Python found.")


def pip_has(py, module):
    return subprocess.run(
        [str(py), "-c", f"import {module}"], capture_output=True
    ).returncode == 0


def main():
    say("Checking platform")
    if sys.platform != "win32":
        fail("This is the Windows build. Use install.sh (in the original repo) on macOS.")
    ok("Windows")

    py = find_python()
    ok(f"using {py}")

    say("Checking ffmpeg and ffprobe")
    for tool in ("ffmpeg", "ffprobe"):
        if shutil.which(tool):
            ok(f"{tool} present")
        else:
            fail(
                f"{tool} not found on PATH.",
                "Install it, then re-run this script: winget install Gyan.FFmpeg",
            )

    say("Checking yt-dlp")
    if shutil.which("yt-dlp"):
        ok("yt-dlp present")
    else:
        say("Installing yt-dlp with pip")
        subprocess.run([str(py), "-m", "pip", "install", "-U", "yt-dlp"], check=True)

    say("Checking faster-whisper")
    if pip_has(py, "faster_whisper"):
        ok("faster-whisper present")
    else:
        say("Installing faster-whisper with pip (one time, a couple of minutes)")
        subprocess.run([str(py), "-m", "pip", "install", "-U", "faster-whisper"], check=True)

    say("Checking for an NVIDIA GPU")
    if shutil.which("nvidia-smi"):
        ok("NVIDIA GPU detected")
        if pip_has(py, "nvidia.cudnn"):
            ok("cuBLAS/cuDNN present")
        else:
            say("Installing cuBLAS + cuDNN with pip (one time, ~1.3GB, several minutes)")
            r = subprocess.run(
                [str(py), "-m", "pip", "install", "-U", "nvidia-cublas-cu12", "nvidia-cudnn-cu12"]
            )
            if r.returncode != 0:
                print("    note: GPU library install failed, the skill still works on CPU",
                      file=sys.stderr)
    else:
        ok("no NVIDIA GPU found, will run on CPU")

    say("Installing the 'transcribe' command")
    BIN_DIR.mkdir(parents=True, exist_ok=True)
    script = SKILL_DIR / "scripts" / "fast_transcribe.py"
    wrapper = BIN_DIR / "transcribe.cmd"
    wrapper.write_text(f'@echo off\r\n"{py}" "{script}" %*\r\n')
    ok(f"installed to {wrapper}")
    path_dirs = [p.strip('"').lower() for p in os.environ.get("PATH", "").split(os.pathsep)]
    if str(BIN_DIR).lower() in path_dirs:
        ok(f"{BIN_DIR} is on your PATH")
    else:
        print(f"    note: {BIN_DIR} is not on your PATH, add it or call the script directly")

    say("Test transcription (first run downloads the Whisper model weights)")
    result = subprocess.run([str(py), str(script), "https://www.youtube.com/watch?v=jNQXAC9IVRw"])
    if result.returncode == 0:
        say("Done. The skill works.")
        print("    Try: transcribe <any video url>")
    else:
        fail("The test transcription failed, read the error above. Common causes: no network, or yt-dlp blocked by the platform.")


if __name__ == "__main__":
    main()
