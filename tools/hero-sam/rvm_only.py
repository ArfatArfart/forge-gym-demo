"""Pure RobustVideoMatting person matte for a colour intermediate. Usage: rvm_only.py <ffmpeg> <model> <work_dir> <name-cut> [...]"""
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort

FF, model, work = sys.argv[1], sys.argv[2], Path(sys.argv[3])
RATIO = {"tall": 0.4, "wide": 0.35}
opts = ort.SessionOptions()
opts.intra_op_num_threads = 0
sess = ort.InferenceSession(model, opts, providers=["CPUExecutionProvider"])

for base in sys.argv[4:]:
    cap = cv2.VideoCapture(str(work / f"{base}-colour.mp4"))
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4
    dr = np.array([RATIO[base.rsplit('-', 1)[1]]], np.float32)

    def step(frame):
        global rec
        x = (cv2.cvtColor(frame, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0).transpose(2, 0, 1)[None]
        _, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": dr})
        return pha[0, 0]

    for _ in range(4):
        step(frames[0])
    h, w = frames[0].shape[:2]
    enc = subprocess.Popen(
        [FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{w}x{h}", "-r", "24", "-i", "-", "-c:v", "ffv1", str(work / f"{base}-matte.mkv")],
        stdin=subprocess.PIPE,
    )
    for f in frames:
        a = np.clip((step(f) - 0.06) / 0.88, 0, 1)
        enc.stdin.write((a * 255 + 0.5).astype(np.uint8).tobytes())
    enc.stdin.close()
    enc.wait()
    print(base, len(frames), flush=True)
