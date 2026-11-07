"""
Merges SAM 2 object masks with the RVM person matte and packs the hero clip.

Usage: python compose.py <name> <cut> <ffmpeg> <work_dir> <sam_masks_dir> <out_dir>
  work_dir holds <name>-<cut>-colour.mp4 and <name>-<cut>-matte.mkv (RVM, from hero-matte.py)
  sam_masks_dir holds <obj>/<frame>.png probabilities from sam_track.py
"""
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

name, cut, FF, work, sam_dir, out = sys.argv[1], sys.argv[2], sys.argv[3], Path(sys.argv[4]), Path(sys.argv[5]), Path(sys.argv[6])
out.mkdir(parents=True, exist_ok=True)
LAYOUT = {
    "tall": dict(frame=(1080, 1280), color=(0, 0, 720, 1280), matte=(720, 0, 360, 640)),
    "wide": dict(frame=(1440, 1232), color=(0, 0, 1440, 810), matte=(0, 816, 720, 406)),
}
L = LAYOUT[cut]
cw, ch = L["color"][2], L["color"][3]


def read_gray(src, w, h):
    p = subprocess.run([FF, "-v", "error", "-i", str(src), "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True, check=True)
    a = np.frombuffer(p.stdout, np.uint8)
    return a.reshape(-1, h, w)


rvm = read_gray(work / f"{name}-{cut}-matte.mkv", cw, ch).astype(np.float32) / 255
n = len(rvm)
objs = sorted(int(p.name) for p in sam_dir.iterdir() if p.is_dir())
print(name, cut, "frames", n, "objects", objs, flush=True)

r = max(2, round(ch / 400))  # ~3 px on both cuts
k_dil = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
min_area = 0.0015 * cw * ch

mattes = []
for f in range(n):
    sam = np.zeros((ch, cw), np.float32)
    for o in objs:
        p = sam_dir / str(o) / f"{f:05d}.png"
        if p.exists():
            sam = np.maximum(sam, cv2.imread(str(p), cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255)
    # Drop specks: SAM sometimes lights up a few stray pixels on shiny background objects.
    binary = (np.maximum(sam, rvm[f]) > 0.5).astype(np.uint8)
    n_lab, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    small = [i for i in range(1, n_lab) if stats[i, cv2.CC_STAT_AREA] < min_area]
    if small:
        speck = np.isin(labels, small)
        sam[speck] = 0
    # Equipment and limbs from SAM get a hair of extra edge so no letter rim shows on them.
    sam = cv2.dilate(sam, k_dil)
    sam = cv2.GaussianBlur(sam, (2 * r + 1, 2 * r + 1), 0)
    m = np.maximum(rvm[f], sam)
    mattes.append(np.clip(m, 0, 1))

matte_file = work / f"{name}-{cut}-matte-sam.mkv"
enc = subprocess.Popen(
    [FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{cw}x{ch}", "-r", "24", "-i", "-", "-c:v", "ffv1", str(matte_file)],
    stdin=subprocess.PIPE,
)
for a in mattes:
    enc.stdin.write((a * 255 + 0.5).astype(np.uint8).tobytes())
enc.stdin.close()
enc.wait()

fw, fh = L["frame"]
cx, cy = L["color"][:2]
mx, my, mw, mh = L["matte"]
fc = (
    f"[0:v]pad={fw}:{fh}:{cx}:{cy}:black[base];"
    f"[1:v]scale={mw}:{mh}:flags=area,format=yuv420p[m];"
    f"[base][m]overlay={mx}:{my}:format=auto,format=yuv420p[v]"
)
colour = work / f"{name}-{cut}-colour.mp4"
packed = out / f"{name}-{cut}.mp4"
subprocess.run([
    FF, "-v", "error", "-y", "-i", str(colour), "-i", str(matte_file), "-filter_complex", fc, "-map", "[v]",
    "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-profile:v", "high",
    "-pix_fmt", "yuv420p", "-g", "48", "-movflags", "+faststart", str(packed),
], check=True)
subprocess.run([FF, "-v", "error", "-y", "-i", str(colour), "-frames:v", "1", "-q:v", "4", str(out / f"{name}-{cut}.jpg")], check=True)
print(packed, round(packed.stat().st_size / 1024), "KB")
