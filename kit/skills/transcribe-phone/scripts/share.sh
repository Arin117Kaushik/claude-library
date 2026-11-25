#!/data/data/com.termux/files/usr/bin/bash
# Makes Termux appear in the Android Share sheet: share a link and it transcribes; share an audio or video file and it does too.
mkdir -p ~/bin
cat > ~/bin/termux-url-opener <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
~/bin/transcribe "$1"
echo; read -p "Press Enter to close"
EOF
cat > ~/bin/termux-file-editor <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
~/bin/transcribe "$1"
echo; read -p "Press Enter to close"
EOF
chmod +x ~/bin/termux-url-opener ~/bin/termux-file-editor
echo "SHARE DONE"
