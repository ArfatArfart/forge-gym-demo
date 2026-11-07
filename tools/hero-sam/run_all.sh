#!/bin/sh
# Track, compose and pack hero clips. Usage: sh run_all.sh [name-cut ...]
S="C:/Users/arfat/AppData/Local/Temp/claude/9552ba6463eb86c0/34bb310a-249d-47a2-8c9d-26e18c5e37cb/scratchpad"
FF="$S/pw/node_modules/ffmpeg-static/ffmpeg.exe"
CLIPS="${*:-barbell-tall barbell-wide strength-tall strength-wide conditioning-tall conditioning-wide foundations-tall foundations-wide}"
cd "$S" || exit 1
for c in $CLIPS; do
  name=${c%-*}; cut=${c##*-}
  rm -rf "sam/masks/$c"
  echo "== track $c"
  sam-env/Scripts/python.exe sam_track.py "sam/frames/$c" "sam/prompts/$c.json" "sam/masks/$c" "$S/models/sam2.1_hiera_large.pt" 2>&1 | grep -vE "it/s\]|s/it\]|^\s*$" || exit 1
  echo "== compose $c"
  sam-env/Scripts/python.exe compose.py "$name" "$cut" "$FF" "$S/hero-work" "sam/masks/$c" "$S/hero-sam-out" || exit 1
  sam-env/Scripts/python.exe comp_sheet.py "$S/hero-sam-out/$c.mp4" "$cut" "$S/comp/after-$c.jpg" 6 0 28
done
echo "ALL DONE"
