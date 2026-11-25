---
name: transcribe
description: Transcribe video or audio from any URL (YouTube, Instagram, X/Twitter, TikTok, Facebook, Vimeo, 1000+ sites) or a local file into text. Runs faster-whisper locally on CPU or GPU, free, no API key. Use when the user says transcribe this video, transcribe [url], get the transcript, what does this video say, or pastes a video URL with transcription intent. Handles many URLs at once. Also triggers on transcribe install or transcribe setup.
---

# Transcribe

URL or file in, text out. Everything runs locally, no API key, no cloud
service, no cost per use.

This is a Windows build. The original skill this is based on ran NVIDIA's
Parakeet model on the Apple Neural Engine, which only exists on Apple
Silicon. There is no Windows equivalent of that engine, so this build uses
faster-whisper (a CTranslate2 implementation of OpenAI Whisper) instead. It
runs on the NVIDIA GPU (cuBLAS/cuDNN installed via pip by install.py) and
falls back to CPU automatically if no GPU is found or the GPU libraries
fail to load.

## Speed, honestly

On GPU this is fast, close to the original's Apple Neural Engine speed for
short clips. On CPU (no NVIDIA GPU present, or the GPU libraries didn't
install) expect roughly realtime to a few times faster than realtime for the
default `small` model, so a two-minute video takes somewhere from a few
seconds to a couple of minutes depending on the machine. `--model tiny`
trades accuracy for speed if that matters more; `--model medium` or
`--model large-v3` go the other way.

## Invocation

```bash
python ~/.claude\skills\transcribe\scripts\fast_transcribe.py "<url>"
```

The installer also puts a `transcribe` wrapper on PATH
(`%USERPROFILE%\.local\bin\transcribe.cmd`) that takes the same arguments,
for use from any terminal or another script.

`/transcribe <url>` passes the URL as the skill argument. If no URL was
given, ask for one. Don't ask about timestamps up front, plain text is what
is wanted almost every time. Add `--timestamps` only if the user asks.

Then present the transcript. The script prints it straight to stdout.

## Term repairs (on by default)

Whisper mishears "Claude" as "cloud" often enough to matter for anyone
making or studying AI content. Every transcript runs through
`references/term-repairs.txt` before you see it, which fixes the
unambiguous cases and deliberately leaves genuine cloud-computing talk
("cloud storage", "Google's cloud infrastructure") untouched. It prints a
one-line count so it is never silent.

The file is a plain list of `regex<TAB>replacement`. Add a line whenever a
new mishearing shows up, it is meant to be edited for your own niche's
vocabulary. `--no-repair` turns it off.

Note: `--words` prints raw model output, before repairs. `--timestamps` and
plain text are both repaired.

## Options

| Flag | What it does |
|---|---|
| `--timestamps` | `[M:SS]` at the start of each segment, split on sentences and pauses |
| `--words` | Word-level timestamps, one per line |
| `--json <path>` | Write one JSON object per input (JSONL), use this for anything programmatic |
| `--workers <n>` | Parallel downloads, default 5 |
| `--quiet` | Transcript only, no title/uploader header |
| `--keep-audio <dir>` | Keep the converted 16kHz wav files |
| `--browser <name>` | Cookie source, default `chrome` |
| `--no-cookies` | Never touch browser cookies |
| `--model <size>` | Whisper size: `tiny`, `base`, `small`, `medium`, `large-v3`. Default `small` |
| `--no-repair` | Skip the term-repair pass |

## Many at once

Pass every URL in one call. Downloads overlap; the model loads once and
transcribes one file at a time (a single Whisper model should not run two
inferences at once):

```bash
python ~/.claude\skills\transcribe\scripts\fast_transcribe.py URL1 URL2 URL3 ... --json out.jsonl --quiet
```

**Five parallel downloads is the ceiling for Instagram**, Instagram downloads
run on the user's real logged-in browser session, and hammering it risks
their account. Raise `--workers` for YouTube if you want, leave it alone for
Instagram.

## Cookies and logins

**Every site is tried logged out first, Instagram included.** Public posts
download fine with no session at all, so a normal run never touches your
browser.

Cookies are a fallback only, for posts that genuinely fail logged out
(private or followers-only). If that fallback fires, yt-dlp reads cookies
from your browser (Chrome by default, `--browser edge` / `--browser firefox`
to change) and you must be logged in to that site there. `--no-cookies`
disables the fallback entirely.

This order matters. Going straight to cookies for Instagram makes every
download authenticated automated activity on the user's own account, the
exact pattern Instagram flags as a bot. Do not reverse it.

## How it works

1. **yt-dlp** grabs audio only.
2. **ffmpeg** converts to 16kHz mono wav. This step costs a fraction of a
   second.
3. **faster-whisper** runs Whisper via CTranslate2 on GPU if it can, CPU
   otherwise, and writes word-level timings.

## Install

Run this when the user says `install this`, `transcribe install`, or
`transcribe setup`:

```bash
python ~/.claude\skills\transcribe\install.py
```

(If the skill lives somewhere else, run the `install.py` next to this file.)

The installer checks each piece, installs only what's missing, and finishes
by transcribing a real YouTube video to prove the whole pipeline. It sets
up:

1. **yt-dlp** via pip, if it is not already on PATH
2. **faster-whisper** via pip
3. **cuBLAS + cuDNN** via pip, only if `nvidia-smi` finds a GPU (skipped
   entirely on a machine with no NVIDIA GPU)
4. **The `transcribe` wrapper** at `%USERPROFILE%\.local\bin\transcribe.cmd`
5. **The Whisper model weights**, downloaded automatically from Hugging Face
   on the first transcription

**ffmpeg is a manual step** (it is a binary, not a Python package):
`winget install Gyan.FFmpeg`. The installer checks for it and tells you if
it is missing.

## If it breaks

The script names the missing piece and how to fix it.

- **`ffmpeg not found` / `ffprobe not found`**, `winget install Gyan.FFmpeg`,
  then re-run.
- **`yt-dlp not found`**, `pip install -U yt-dlp`, or re-run `install.py`.
- **A YouTube download fails**, yt-dlp is probably stale.
  `pip install -U yt-dlp` fixes it; anything older than a few months breaks
  on YouTube.
- **An Instagram download fails**, make sure the user is logged in to
  Instagram in Chrome (or pass `--browser` for the browser they actually
  use).
- **GPU not being used**, re-run `install.py`, it installs cuBLAS/cuDNN if
  `nvidia-smi` finds a GPU and they are missing. If it still falls back to
  CPU, that's the safe default kicking in, the skill still works, just
  slower.

First run downloads the Whisper model weights (a few hundred MB depending on
size). Every run after that is fast to load.
