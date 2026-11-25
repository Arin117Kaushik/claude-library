---
name: transcribe-phone
description: Transcribe a video, voice note or audio link on the user's Android phone with no laptop, using whisper.cpp in Termux. Use when they want a transcript on the go, says "transcribe" while away from the laptop, or asks to set up or fix phone transcription.
---

# transcribe-phone

Whisper runs on the phone (Termux, whisper.cpp, base multilingual q5 model). Tested on the CPH2661: a 19 second YouTube clip transcribed correctly in under 30 seconds.

## Use on the phone (the user)

- Share a link (YouTube, Instagram, X, TikTok and others yt-dlp supports) or an audio or video file to **Termux** from the Android share sheet. The transcript prints and is saved. Press Enter to close.
- Or in Termux: `transcribe <link or file path> [language code]`. Language defaults to auto detect, use `hi` or `en` to force.
- Transcripts are saved in `Downloads/Transcripts/<date-time>.txt` on the phone.

## Use from Claude Code on the laptop

The phone is linked by adb (`adb devices` shows `e2eb0573`). Use PowerShell, never Git Bash, for adb paths.
1. Wake and unlock check: `adb shell input keyevent KEYCODE_WAKEUP`, then screenshot with `adb shell screencap -p /sdcard/s.png` and pull it.
2. Open Termux: `adb shell monkey -p com.termux -c android.intent.category.LAUNCHER 1`.
3. Type the command: `adb shell "input text '~/bin/transcribe%s<url>'"` (spaces are `%s`, quote the whole text), then `adb shell input keyevent KEYCODE_ENTER`.
4. Wait, screenshot to read the result, or `adb pull /sdcard/Download/Transcripts/<file>.txt`.

## Rebuild from scratch

Push `scripts/setup.sh` and `scripts/share.sh` to `/sdcard/Download/` (rename to `termux_setup.sh` and `termux_share.sh`), open Termux, run `bash /sdcard/Download/termux_setup.sh` (about 5 minutes, needs Wi-Fi and 400 MB), then `bash /sdcard/Download/termux_share.sh`.

## Limits

- Base model: fine for clear speech, weaker on heavy accents and noise. For better accuracy download `ggml-small-q5_1.bin` into `~/whisper.cpp/models` and change the model path in `~/bin/transcribe` (slower, about 3x).
- Phone must be unlocked for Claude Code to drive it. A share from the phone itself needs nothing else.
