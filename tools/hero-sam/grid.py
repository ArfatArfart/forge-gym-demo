"""Frames with a labelled pixel grid, for placing SAM prompts. Usage: grid.py <frames_dir> <out.jpg> <idx,idx,...> [step]"""
import sys
import cv2
import numpy as np

d, dst, idxs = sys.argv[1], sys.argv[2], [int(i) for i in sys.argv[3].split(',')]
step = int(sys.argv[4]) if len(sys.argv) > 4 else 100
tiles = []
for i in idxs:
    f = cv2.imread(f"{d}/{i:05d}.jpg")
    h, w = f.shape[:2]
    for x in range(0, w, step):
        cv2.line(f, (x, 0), (x, h), (0, 0, 255) if x % (step * 5) == 0 else (0, 200, 255), 1)
        cv2.putText(f, str(x), (x + 2, 14), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)
    for y in range(0, h, step):
        cv2.line(f, (0, y), (w, y), (0, 0, 255) if y % (step * 5) == 0 else (0, 200, 255), 1)
        cv2.putText(f, str(y), (2, y - 3), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)
    cv2.putText(f, f"#{i}", (w - 90, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.1, (255, 255, 255), 2)
    tiles.append(f)
cv2.imwrite(dst, np.hstack(tiles), [cv2.IMWRITE_JPEG_QUALITY, 90])
