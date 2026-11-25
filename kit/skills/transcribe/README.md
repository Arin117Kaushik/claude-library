# transcribe (Windows build)

Transcribe any video or audio, YouTube, Instagram, X/Twitter, Facebook,
Vimeo, 1000+ sites, or a local file, into text, locally.

This is a Windows port of Hugo Manning's
[transcribe-skill](https://github.com/learnaiwithhugo/transcribe-skill),
which runs NVIDIA's Parakeet model on the Apple Neural Engine through
FluidAudio. That engine only exists on Apple Silicon. Since there is no
Windows equivalent, this build swaps in
[faster-whisper](https://github.com/SYSTRAN/faster-whisper), a CTranslate2
implementation of OpenAI Whisper that runs on CPU or NVIDIA GPU. No API key,
no cloud service, nothing per use.

```
you:    transcribe https://www.instagram.com/reel/ABC123/
claude: --- Instagram | some reel | @creator | 0:58 ---

        Okay so I built a thing this week...
```

## Install

```
python install.py
```

Claude runs the installer, which checks every piece, installs only what's
missing with pip, and finishes by transcribing a real YouTube video to prove
it works.

What gets installed:

| Piece | How |
|---|---|
| ffmpeg + ffprobe | manual, `winget install Gyan.FFmpeg` (checked, not installed for you) |
| yt-dlp | pip |
| faster-whisper | pip |
| cuBLAS + cuDNN | pip, only if `nvidia-smi` finds a GPU |
| `transcribe` command | `%USERPROFILE%\.local\bin\transcribe.cmd` |
| Whisper model weights | downloaded automatically from Hugging Face on first run |

**Requirements:** Windows, Python 3.9+, ffmpeg.

## Use

In Claude Code:

```
transcribe this: <url>
```

Or from any terminal:

```
transcribe "<url or file>"                      # plain text
transcribe "<url>" --timestamps                 # [M:SS] segments
transcribe URL1 URL2 URL3 --json out.jsonl      # batch, structured output
```

## Speed, honestly

The original build advertised roughly two seconds per video because the
Apple Neural Engine makes inference close to free. On an NVIDIA GPU (which
`install.py` sets up automatically), faster-whisper gets close to that.
Without a GPU, or if the GPU libraries fail to load, it falls back to CPU:
expect somewhere around realtime to a few times faster than realtime with
the default `small` model. `--model tiny` is the fastest, lowest-accuracy
option if speed matters more than precision for a given job.

## The "cloud" problem, solved

Whisper mishears "Claude" as "cloud" often enough to matter for anyone
making or studying AI content. Every transcript runs through a plain-text
repair file (`references/term-repairs.txt`) that fixes the unambiguous
cases and deliberately leaves genuine cloud-computing talk alone. It's a
simple `regex<TAB>replacement` list, add your own niche's mishearings.

## Notes

- **No login needed, and no cookies touched on a normal run.** Every site,
  Instagram included, is tried logged out first, and public posts download
  fine that way. Only a post that genuinely fails logged out (private or
  followers-only) falls back to reading cookies from your browser, Chrome by
  default (`--browser edge` etc. to change). `--no-cookies` turns that
  fallback off completely.
- Full flags and behaviour: [SKILL.md](SKILL.md).

## Credits

- [Hugo Manning](https://github.com/learnaiwithhugo/transcribe-skill), the
  original macOS/Parakeet skill this is ported from
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper), the
  CTranslate2 engine used on Windows
- [Whisper](https://github.com/openai/whisper), OpenAI's speech model
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) and [ffmpeg](https://ffmpeg.org)

## License

MIT, see [LICENSE](LICENSE). The original skill is MIT-licensed by Hugo
Manning; this is a derivative work for the Windows port.
