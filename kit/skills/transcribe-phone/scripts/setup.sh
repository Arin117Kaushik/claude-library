#!/data/data/com.termux/files/usr/bin/bash
# Sets up phone transcription in Termux: yt-dlp + ffmpeg + whisper.cpp + a `transcribe` command.
set -e
yes | pkg update -y
pkg install -y python ffmpeg cmake clang git make wget
pip install -U yt-dlp
cd ~
[ -d whisper.cpp ] || git clone --depth 1 https://github.com/ggml-org/whisper.cpp
cd whisper.cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j4 --config Release
mkdir -p models
[ -f models/ggml-base-q5_1.bin ] || wget -O models/ggml-base-q5_1.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base-q5_1.bin
mkdir -p ~/bin ~/storage/downloads/Transcripts 2>/dev/null || true
cat > ~/bin/transcribe <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# usage: transcribe <video or audio URL | local file> [language code, default auto]
in="$1"; lang="${2:-auto}"; out="$HOME/storage/downloads/Transcripts"; mkdir -p "$out"; tmp=$(mktemp -d)
if [[ "$in" == http* ]]; then yt-dlp -x --no-playlist -o "$tmp/a.%(ext)s" "$in" >/dev/null || exit 1; src=$(ls $tmp/a.* | head -1); else src="$in"; fi
ffmpeg -loglevel error -y -i "$src" -ar 16000 -ac 1 "$tmp/a.wav" || exit 1
name=$(date +%Y%m%d-%H%M%S)
~/whisper.cpp/build/bin/whisper-cli -m ~/whisper.cpp/models/ggml-base-q5_1.bin -f "$tmp/a.wav" -l "$lang" -nt -otxt -of "$out/$name" >/dev/null 2>&1
cat "$out/$name.txt"; echo; echo "Saved: Downloads/Transcripts/$name.txt"; rm -rf "$tmp"
EOF
chmod +x ~/bin/transcribe
grep -q 'HOME/bin' ~/.bashrc 2>/dev/null || echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc
echo "SETUP DONE"
