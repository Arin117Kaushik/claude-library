#!/usr/bin/env python3
"""Video/audio transcription (Windows build).

yt-dlp (download) -> ffmpeg (16kHz mono wav) -> faster-whisper (CTranslate2).

This is a Windows port of a skill originally built around Apple's Neural
Engine (FluidAudio + Parakeet), which only runs on Apple Silicon. There is no
Windows equivalent of that engine, so this build swaps in faster-whisper: a
CTranslate2-based Whisper implementation that runs on ordinary CPUs, and uses
an NVIDIA GPU automatically if CUDA and cuDNN are already working. No API
key, no cloud service. The first run downloads the model weights from
Hugging Face automatically.

Usage:
    fast_transcribe.py <url|file> [<url|file> ...] [options]

Options:
    --timestamps         Print [M:SS] segment timestamps
    --words              Print word-level timestamps
    --json <path>        Write one JSON object per input to this file
    --workers <n>        Parallel downloads (default 5)
    --browser <name>     Browser to pull cookies from (default chrome)
    --no-cookies         Never touch browser cookies
    --keep-audio <dir>   Keep the converted wav files here
    --model <size>       Whisper model size: tiny, base, small, medium,
                          large-v3 (default small)
    --no-repair          Skip the term-repair pass (see references/term-repairs.txt)
    --quiet              Transcript only, no header lines
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

MODEL_SIZES = ("tiny", "base", "small", "medium", "large-v3")

# Sites that MAY need a logged-in session, for private or followers-only posts.
# Public posts on all of them download fine logged out, so this list no longer
# forces cookies: it is only a hint about where the fallback is worth trying.
COOKIE_DOMAINS = ("instagram.com", "facebook.com", "threads.net", "threads.com")

_MODEL_CACHE = {}
_MODEL_LOCK = threading.Lock()
_TRANSCRIBE_LOCK = threading.Lock()  # ctranslate2 model, one call at a time


def die(msg, hint=None):
    print(f"ERROR: {msg}", file=sys.stderr)
    if hint:
        print(hint, file=sys.stderr)
    sys.exit(1)


def find_ytdlp():
    found = shutil.which("yt-dlp")
    if found:
        return found
    die(
        "yt-dlp not found.",
        "Run the installer from the skill folder:\n"
        "  python install.py\n"
        "or install it yourself: pip install -U yt-dlp",
    )


def need(tool):
    found = shutil.which(tool)
    if not found:
        die(
            f"{tool} not found.",
            "Install ffmpeg (which includes ffprobe): winget install Gyan.FFmpeg",
        )
    return found


def _add_nvidia_dll_dirs():
    """Point Windows' DLL loader at the cuBLAS/cuDNN DLLs from the pip wheels
    (nvidia-cublas-cu12, nvidia-cudnn-cu12). Windows does not search
    site-packages for native DLLs on its own, unlike Linux's rpath handling,
    so without this the GPU path fails at inference with a 'DLL not found'
    even though the packages are installed."""
    if sys.platform != "win32":
        return
    import site
    roots = [Path(p) for p in site.getsitepackages()] if hasattr(site, "getsitepackages") else []
    roots.append(Path(site.getusersitepackages()))
    for root in roots:
        nvidia_dir = root / "nvidia"
        if not nvidia_dir.is_dir():
            continue
        for bin_dir in nvidia_dir.glob("*/bin"):
            try:
                os.add_dll_directory(str(bin_dir))
            except OSError:
                pass


def _silence_wav():
    """A throwaway silent wav, just to force a real inference for the GPU probe.
    cuBLAS/cuDNN problems don't surface until a model actually runs, loading
    the model cleanly is not enough to prove GPU support works."""
    import wave
    path = Path(tempfile.gettempdir()) / "transcribe_silence_probe.wav"
    if not path.is_file():
        with wave.open(str(path), "wb") as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(16000)
            f.writeframes(b"\x00\x00" * 8000)  # 0.5s of silence
    return str(path)


def load_model(size):
    """Load (and cache) a faster-whisper model. Tries GPU, falls back to CPU.

    A missing/mismatched cuDNN install doesn't fail at WhisperModel(), it
    fails the first time something is actually transcribed, so the GPU path
    is only trusted after a real probe transcription succeeds.
    """
    with _MODEL_LOCK:
        if size in _MODEL_CACHE:
            return _MODEL_CACHE[size]
        _add_nvidia_dll_dirs()
        from faster_whisper import WhisperModel

        try:
            model = WhisperModel(size, device="cuda", compute_type="float16")
            list(model.transcribe(_silence_wav())[0])
            print(f"Loaded Whisper '{size}' on GPU (CUDA).", file=sys.stderr)
        except Exception:
            model = WhisperModel(size, device="cpu", compute_type="int8")
            print(f"Loaded Whisper '{size}' on CPU (GPU unavailable or missing cuDNN).",
                  file=sys.stderr)
        _MODEL_CACHE[size] = model
        return model


def is_local_file(s):
    return Path(s).expanduser().is_file()


def wants_cookies(url):
    return any(d in url.lower() for d in COOKIE_DOMAINS)


def run(cmd, timeout=1200):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def download(url, workdir, ytdlp, browser, no_cookies):
    """Download bestaudio into workdir. Returns (media_path, meta_dict)."""
    out = str(Path(workdir) / "%(id)s.%(ext)s")
    base = [
        ytdlp, "-f", "bestaudio/best", "-o", out,
        "--no-playlist", "--write-info-json", "--no-warnings", "-q",
    ]

    attempts = []
    if no_cookies:
        attempts.append(base)
    else:
        # Logged out ALWAYS first, Instagram included. Public reels download
        # fine with no session at all. Presenting your real login turns every
        # download into authenticated automated activity on your own account,
        # which is what platforms flag as bot behaviour. Cookies stay only as
        # a fallback for private or followers-only posts that fail logged out.
        attempts.append(base)
        attempts.append(base + ["--cookies-from-browser", browser])

    last = None
    for cmd in attempts:
        res = run(cmd + [url])
        media = [
            p for p in Path(workdir).iterdir()
            if p.is_file() and not p.name.endswith(".info.json")
        ]
        if res.returncode == 0 and media:
            meta = {}
            infos = list(Path(workdir).glob("*.info.json"))
            if infos:
                try:
                    meta = json.loads(infos[0].read_text(encoding="utf-8"))
                except Exception:
                    pass
            return str(media[0]), meta
        last = (res.stderr or res.stdout or "").strip()
        for p in Path(workdir).iterdir():
            p.unlink(missing_ok=True)

    tail = "\n".join(last.splitlines()[-3:]) if last else "no output"
    raise RuntimeError(f"download failed for {url}\n{tail}")


def to_wav(src, dest, ffmpeg):
    """Whisper wants 16kHz mono wav; this also normalises whatever yt-dlp gave us."""
    res = run([ffmpeg, "-y", "-loglevel", "error", "-i", src,
               "-ar", "16000", "-ac", "1", dest])
    if res.returncode != 0 or not Path(dest).is_file():
        raise RuntimeError(f"ffmpeg conversion failed:\n{res.stderr.strip()}")
    return dest


def wav_seconds(path, ffprobe):
    res = run([ffprobe, "-v", "error", "-show_entries", "format=duration",
               "-of", "default=noprint_wrappers=1:nokey=1", path])
    try:
        return float(res.stdout.strip())
    except (ValueError, AttributeError):
        return 0.0


def transcribe(wav, model):
    """Run faster-whisper and shape the output like word-level timings."""
    with _TRANSCRIBE_LOCK:
        segments, _info = model.transcribe(wav, word_timestamps=True, vad_filter=True)
        text_parts, words = [], []
        for seg in segments:
            text_parts.append(seg.text.strip())
            for w in (seg.words or []):
                words.append({"word": w.word, "startTime": w.start, "endTime": w.end})
        return {"text": " ".join(text_parts).strip(), "wordTimings": words}


REPAIRS_FILE = Path(__file__).resolve().parent.parent / "references" / "term-repairs.txt"


def load_repairs():
    """Read the term-repair rules. Whisper mishears 'Claude' as 'cloud' often
    enough to matter for AI content. The rules file fixes the unambiguous
    cases and deliberately leaves genuine cloud-computing talk alone."""
    if not REPAIRS_FILE.is_file():
        return []
    rules = []
    for n, line in enumerate(REPAIRS_FILE.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        pattern, tab, replacement = line.partition("\t")
        if not tab:
            print(f"WARNING: {REPAIRS_FILE.name} line {n} has no tab, skipped",
                  file=sys.stderr)
            continue
        try:
            rules.append((re.compile(pattern), replacement))
        except re.error as e:
            print(f"WARNING: {REPAIRS_FILE.name} line {n} is not valid regex ({e}), skipped",
                  file=sys.stderr)
    return rules


def repair(text, rules):
    """Apply the rules, and count what actually changed so it is never silent."""
    changes = 0
    for rx, replacement in rules:
        text, n = rx.subn(replacement, text)
        changes += n
    return text, changes


def fmt_time(seconds):
    seconds = int(seconds)
    h, m, s = seconds // 3600, (seconds % 3600) // 60, seconds % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def segment(words, max_seconds=14.0, gap=0.65):
    """Group word timings into readable segments: sentence ends, long pauses,
    or a hard length cap, whichever comes first."""
    segs, cur, start, prev_end = [], [], None, None
    for w in words:
        text = (w.get("word") or "").strip()
        if not text:
            continue
        ws, we = w.get("startTime", 0.0), w.get("endTime", 0.0)
        if start is None:
            start = ws
        if cur and (
            (prev_end is not None and ws - prev_end > gap)
            or (we - start > max_seconds)
        ):
            segs.append({"start": start, "end": prev_end, "text": " ".join(cur)})
            cur, start = [], ws
        cur.append(text)
        prev_end = we
        if text.endswith((".", "?", "!")) and we - start > 4.0:
            segs.append({"start": start, "end": we, "text": " ".join(cur)})
            cur, start, prev_end = [], None, we
    if cur:
        segs.append({"start": start or 0.0, "end": prev_end or 0.0, "text": " ".join(cur)})
    return segs


def paragraphs(text, every=4):
    """Break a wall of text into readable paragraphs on sentence boundaries."""
    text = text.strip()
    if not text:
        return text
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return "\n\n".join(
        " ".join(sentences[i:i + every]) for i in range(0, len(sentences), every)
    )


def process(item, tools, opts, workroot):
    """Download (unless local), convert, transcribe. Returns a result dict."""
    name = item if len(item) < 80 else item[:77] + "..."
    workdir = tempfile.mkdtemp(dir=workroot)
    try:
        if is_local_file(item):
            media, meta = str(Path(item).expanduser()), {}
        else:
            media, meta = download(
                item, workdir, tools["ytdlp"], opts["browser"], opts["no_cookies"]
            )

        wav = str(Path(workdir) / "audio.wav")
        to_wav(media, wav, tools["ffmpeg"])
        seconds = wav_seconds(wav, tools["ffprobe"])

        data = transcribe(wav, tools["model"])
        text = (data.get("text") or "").strip()
        repairs = 0
        if not opts["no_repair"]:
            text, repairs = repair(text, tools["repairs"])

        if opts["keep_audio"]:
            dest = Path(opts["keep_audio"]).expanduser()
            dest.mkdir(parents=True, exist_ok=True)
            stem = meta.get("id") or Path(item).stem
            shutil.copy2(wav, dest / f"{stem}.wav")

        words = data.get("wordTimings") or []
        segs = segment(words)
        if not opts["no_repair"]:
            for s in segs:
                s["text"], n = repair(s["text"], tools["repairs"])

        return {
            "source": item,
            "ok": True,
            "title": meta.get("title") or Path(item).name,
            "uploader": meta.get("uploader") or meta.get("channel") or "",
            "platform": meta.get("extractor_key") or meta.get("extractor") or "local file",
            "duration": seconds,
            "text": text,
            "repairs": repairs,
            "words": words,
            "segments": segs,
        }
    except Exception as e:
        return {"source": item, "ok": False, "error": str(e), "title": name}
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


def render(r, opts):
    if not r["ok"]:
        print(f"--- FAILED: {r['title']} ---", file=sys.stderr)
        print(r["error"], file=sys.stderr)
        return

    if not opts["quiet"]:
        bits = [b for b in (r["platform"], r["title"], r["uploader"]) if b]
        head = " | ".join(bits)
        if r["duration"]:
            head += f" | {fmt_time(r['duration'])}"
        print(f"--- {head} ---")
        print()

    if opts["words"] and r["words"]:
        if r.get("repairs"):
            print("(word-level output is raw model output, before term repairs)",
                  file=sys.stderr)
        for w in r["words"]:
            print(f"[{w.get('startTime', 0):.2f}] {(w.get('word') or '').strip()}")
    elif opts["timestamps"] and r.get("segments"):
        for s in r["segments"]:
            print(f"[{fmt_time(s['start'])}] {s['text']}")
    elif opts["timestamps"]:
        print("(no word timings returned, printing plain text)", file=sys.stderr)
        print(paragraphs(r["text"]))
    else:
        print(paragraphs(r["text"]))
    print()


def parse_argv(argv):
    opts = {
        "timestamps": False, "words": False, "json": None, "workers": 5,
        "browser": "chrome", "no_cookies": False, "keep_audio": None,
        "version": "small", "quiet": False, "no_repair": False,
    }
    items, i = [], 0
    flags = {"--timestamps": "timestamps", "--words": "words",
             "--no-cookies": "no_cookies", "--quiet": "quiet",
             "--no-repair": "no_repair"}
    valued = {"--json": "json", "--workers": "workers", "--browser": "browser",
              "--keep-audio": "keep_audio", "--model": "version"}
    while i < len(argv):
        a = argv[i]
        if a in flags:
            opts[flags[a]] = True
        elif a in valued:
            if i + 1 >= len(argv):
                die(f"{a} needs a value")
            val = argv[i + 1]
            opts[valued[a]] = int(val) if a == "--workers" else val
            i += 1
        elif a in ("--help", "-h"):
            print(__doc__)
            sys.exit(0)
        elif a.startswith("--"):
            die(f"unknown option {a}")
        else:
            items.append(a)
        i += 1
    if opts["version"] not in MODEL_SIZES:
        die(f"--model must be one of: {', '.join(MODEL_SIZES)}")
    return items, opts


def main():
    # Windows consoles default to a legacy codepage, not UTF-8; transcripts
    # of non-English audio can otherwise crash on print() with a
    # UnicodeEncodeError.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")

    items, opts = parse_argv(sys.argv[1:])
    if not items:
        print(__doc__)
        sys.exit(1)

    tools = {
        "ytdlp": find_ytdlp(),
        "ffmpeg": need("ffmpeg"),
        "ffprobe": need("ffprobe"),
        "repairs": [] if opts["no_repair"] else load_repairs(),
    }
    tools["model"] = load_model(opts["version"])

    workroot = tempfile.mkdtemp(prefix="fasttranscribe-")
    try:
        if len(items) == 1:
            results = [process(items[0], tools, opts, workroot)]
        else:
            # Downloads are the slow part, so overlap them; transcription
            # itself is serialised (see _TRANSCRIBE_LOCK) since one
            # faster-whisper model shouldn't run concurrent inferences.
            workers = max(1, min(opts["workers"], len(items)))
            print(f"Transcribing {len(items)} items ({workers} parallel downloads)...",
                  file=sys.stderr)
            with ThreadPoolExecutor(max_workers=workers) as pool:
                results = list(pool.map(
                    lambda it: process(it, tools, opts, workroot), items))

        for r in results:
            render(r, opts)

        if opts["json"]:
            with open(Path(opts["json"]).expanduser(), "w", encoding="utf-8") as f:
                for r in results:
                    f.write(json.dumps(r) + "\n")
            print(f"JSON written to {opts['json']}", file=sys.stderr)

        fixed = sum(r.get("repairs", 0) for r in results if r["ok"])
        if fixed:
            print(f"({fixed} term{'s' if fixed != 1 else ''} repaired, see "
                  f"references/term-repairs.txt, or pass --no-repair)", file=sys.stderr)

        failed = [r for r in results if not r["ok"]]
        if failed:
            print(f"\n{len(failed)}/{len(results)} failed.", file=sys.stderr)
            sys.exit(2)
    finally:
        shutil.rmtree(workroot, ignore_errors=True)


if __name__ == "__main__":
    main()
