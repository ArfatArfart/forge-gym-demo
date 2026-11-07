"""Composite contact sheet of a packed hero clip, the way the site draws it: dimmed footage, solid
letters across the wordmark band, then the matte on top. Anything the letters cover is a defect.
Usage: python comp_sheet.py <packed.mp4> <cut> <out.jpg> [step] [start] [count] [tile_w]"""
import sys
import cv2
import numpy as np

src, cut, dst = sys.argv[1], sys.argv[2], sys.argv[3]
step = int(sys.argv[4]) if len(sys.argv) > 4 else 4
start = int(sys.argv[5]) if len(sys.argv) > 5 else 0
count = int(sys.argv[6]) if len(sys.argv) > 6 else 999
tw = int(sys.argv[7]) if len(sys.argv) > 7 else (200 if cut == "tall" else 320)
PACK = {"tall": ((0, 0, 720, 1280), (720, 0, 360, 640)), "wide": ((0, 0, 1440, 810), (0, 816, 720, 406))}
(cx, cy, cw, ch), (mx, my, mw, mh) = PACK[cut]
# Band covers the wordmark on every screen shape we ship to (generous on purpose).
band = (0.17, 0.40) if cut == "tall" else (0.08, 0.46)

# Solid letter layer: big block letters filling the band, alternating so gaps are visible too.
letters = np.zeros((ch, cw), np.float32)
y0, y1 = int(band[0] * ch), int(band[1] * ch)
n = 5
for i in range(n):
    x0 = int(i * cw / n + cw * 0.012)
    x1 = int((i + 1) * cw / n - cw * 0.012)
    letters[y0:y1, x0:x1] = 1.0
    # A window in each letter so thin objects crossing it are easy to judge.
    wy0, wy1 = y0 + (y1 - y0) // 3, y1 - (y1 - y0) // 3
    wx0, wx1 = x0 + (x1 - x0) // 3, x1 - (x1 - x0) // 3
    letters[wy0:wy1, wx0:wx1] = 0.0
letter_rgb = np.array([235, 235, 230], np.float32)

cap = cv2.VideoCapture(src)
tiles = []
i = 0
while True:
    ok, f = cap.read()
    if not ok:
        break
    if i >= start and (i - start) % step == 0 and len(tiles) < count:
        col = f[cy:cy + ch, cx:cx + cw].astype(np.float32)
        m = cv2.resize(f[my:my + mh, mx:mx + mw, 1], (cw, ch), interpolation=cv2.INTER_LINEAR).astype(np.float32) / 255
        m = np.clip((m - 0.08) / 0.84, 0, 1)
        m = m * m * (3 - 2 * m)
        scene = col * 0.6
        behind = scene * (1 - letters[..., None]) + letter_rgb * letters[..., None]
        out = behind * (1 - m[..., None]) + scene * m[..., None]
        out = out.astype(np.uint8)
        cv2.putText(out, str(i), (8, 36), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (60, 255, 60), 3)
        tiles.append(cv2.resize(out, (tw, int(ch * tw / cw)), interpolation=cv2.INTER_AREA))
    i += 1
cols = 8 if cut == "tall" else 5
while len(tiles) % cols:
    tiles.append(np.zeros_like(tiles[0]))
rows = [np.hstack(tiles[r:r + cols]) for r in range(0, len(tiles), cols)]
cv2.imwrite(dst, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])
print(dst, i, "frames")
