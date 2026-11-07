"""
Builds packed hero clips: colour footage plus a person matte in one H.264 file.

For each program clip and cut (tall for phones, wide for desktop):
  1. ffmpeg makes a high quality graded colour intermediate.
  2. RobustVideoMatting (ONNX) computes a per frame alpha matte of the athlete.
  3. ffmpeg packs colour + half resolution matte into one frame and encodes it for the web.

Layouts (pixels, 16 aligned so compression never mixes colour and matte):
  tall: frame 1080x1280, colour [0,0,720,1280], matte [720,0,360,640]
  wide: frame 1440x1232, colour [0,0,1440,810], matte [0,816,720,406]

Usage: python matte.py <raw_dir> <work_dir> <out_dir> <ffmpeg> <model> [only_name]
"""
import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort

raw, work, out, FF, model_path = (Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), sys.argv[4], sys.argv[5])
only = sys.argv[6] if len(sys.argv) > 6 else None
work.mkdir(parents=True, exist_ok=True)
out.mkdir(parents=True, exist_ok=True)

GRADE = "eq=contrast=1.06:brightness=-0.03:saturation=0.85"

CLIPS = [
    # name, landscape source, start, duration, subject centre for portrait crop, portrait source override,
    # bgsub: tripod shot, so moving equipment is added to the matte by background subtraction
    dict(name="strength", src="52089-1080.mp4", ss=3.4, t=7, cx=0.36, bgsub=True),
    dict(name="conditioning", src="52088-1080.mp4", ss=0.0, t=7, cx=0.5, portrait="52079-1080.mp4"),
    dict(name="barbell", src="52094-1080.mp4", ss=0.5, t=7, cx=0.45, bgsub=True),
    dict(name="foundations", src="52102-1080.mp4", ss=0.0, t=7, cx=0.5),
]

LAYOUT = {
    "tall": dict(frame=(1080, 1280), color=(0, 0, 720, 1280), matte=(720, 0, 360, 640), ratio=0.4),
    "wide": dict(frame=(1440, 1232), color=(0, 0, 1440, 810), matte=(0, 816, 720, 406), ratio=0.35),
}


def run(args):
    subprocess.run([FF, "-v", "error", "-y", *args], check=True)


def colour_intermediate(c, cut, dst):
    if cut == "wide":
        vf = f"scale=1440:810:flags=lanczos,{GRADE},fps=24"
        src = raw / c["src"]
    elif c.get("portrait"):
        vf = f"scale=720:1280:flags=lanczos,{GRADE},fps=24"
        src = raw / c["portrait"]
    else:
        x = round(min(max(c["cx"] * 1920 - 304, 0), 1920 - 608))
        vf = f"crop=608:1080:{x}:0,scale=720:1280:flags=lanczos,{GRADE},fps=24"
        src = raw / c["src"]
    run(["-ss", str(c["ss"]), "-t", str(c["t"]), "-i", str(src), "-vf", vf, "-an", "-c:v", "libx264", "-crf", "10", "-preset", "medium", "-pix_fmt", "yuv420p", str(dst)])


def read_frames(src):
    cap = cv2.VideoCapture(str(src))
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    cap.release()
    return frames


def person_mattes(sess, frames, ratio):
    """RobustVideoMatting, run in order so its recurrent state keeps edges temporally stable."""
    rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4
    dr = np.array([ratio], np.float32)

    def step(frame):
        nonlocal rec
        x = (cv2.cvtColor(frame, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0).transpose(2, 0, 1)[None]
        _, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": dr})
        return pha[0, 0]

    for _ in range(4):  # warm the state so frame 0 is already stable
        step(frames[0])
    out = []
    for f in frames:
        a = np.clip((step(f) - 0.06) / 0.88, 0, 1)  # levels: kill faint haze, keep soft edges
        out.append(a.astype(np.float32))
    return out


def moving_mattes(frames, bg_pct=50):
    """Background subtraction for tripod shots: anything that moves (bar, plates) joins the matte."""
    h, w = frames[0].shape[:2]
    s = 0.5
    small = np.stack([cv2.resize(f, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA) for f in frames]).astype(np.int16)
    # Repetitive lifts park dark plates in the same spot for half the clip, so a median would
    # bake the plate into the background. A higher percentile recovers the lighter wall behind it.
    bg = np.percentile(small, bg_pct, axis=0).astype(np.float32)
    sh, sw = bg.shape[:2]
    bg_gray = cv2.cvtColor(bg.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
    window = cv2.createHanningWindow((sw, sh), cv2.CV_32F)
    # Hard edges in the background (light tubes, ceiling slats) flicker on tiny camera shake:
    # demand a much larger change there before calling it motion.
    gx = cv2.Sobel(bg_gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(bg_gray, cv2.CV_32F, 0, 1, ksize=3)
    edges = np.clip(np.hypot(gx, gy) / 80.0, 0, 1)
    edges = cv2.GaussianBlur(cv2.dilate(edges, np.ones((7, 7), np.uint8)), (7, 7), 0)
    threshold = 24.0 + 70.0 * edges
    k_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    k_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    out = []
    prev = None
    for f in small:
        f = f.astype(np.float32)
        # Undo sub pixel camera shake before differencing.
        (dx, dy), _ = cv2.phaseCorrelate(bg_gray, cv2.cvtColor(f.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32), window)
        f = cv2.warpAffine(f, np.float32([[1, 0, -dx], [0, 1, -dy]]), (sw, sh), borderMode=cv2.BORDER_REFLECT)
        d = np.abs(f - bg).max(axis=2)
        d = cv2.GaussianBlur(d, (5, 5), 0)
        m = np.clip((d - threshold) / 30.0, 0, 1)
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k_open)
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k_close)
        m = cv2.GaussianBlur(m, (5, 5), 0)
        if prev is not None:
            m = 0.65 * m + 0.35 * prev  # light temporal smoothing against flicker
        prev = m
        out.append(cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR))
    return out


def write_matte(mattes, dst):
    h, w = mattes[0].shape
    enc = subprocess.Popen(
        [FF, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{w}x{h}", "-r", "24", "-i", "-", "-c:v", "ffv1", str(dst)],
        stdin=subprocess.PIPE,
    )
    for a in mattes:
        enc.stdin.write((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
    enc.stdin.close()
    enc.wait()


def matte(sess, src, dst, ratio, bgsub, bg_pct=50):
    frames = read_frames(src)
    h, w = frames[0].shape[:2]
    mattes = person_mattes(sess, frames, ratio)
    if bgsub:
        moving = moving_mattes(frames, bg_pct)
        merged = []
        for a, b in zip(mattes, moving):
            # Equipment is physically attached to the athlete: keep only moving regions that
            # connect to the person, which drops flicker from lights and ceiling slats.
            h2, w2 = a.shape[0] // 2, a.shape[1] // 2
            a_s = cv2.resize(a, (w2, h2), interpolation=cv2.INTER_AREA)
            b_s = cv2.resize(b, (w2, h2), interpolation=cv2.INTER_AREA)
            b_s[: int(h2 * 0.1)] = 0  # ceiling: above the wordmark, and where slats flicker
            person = cv2.dilate((a_s > 0.5).astype(np.uint8), np.ones((11, 11), np.uint8))  # bridge hand to bar
            binary = ((b_s > 0.15) | (person > 0)).astype(np.uint8)
            n_lab, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
            person_ids = np.unique(labels[person > 0])
            person_ids = person_ids[person_ids > 0]
            # Large moving shapes (a swinging plate) are kept even when the thin bar between
            # hand and plate is too faint to connect them. Flicker specks are tiny.
            big = [i for i in range(1, n_lab) if stats[i, cv2.CC_STAT_AREA] >= 0.008 * h2 * w2]
            keep = np.isin(labels, np.concatenate([person_ids, np.array(big, dtype=person_ids.dtype)])).astype(np.float32)
            keep = cv2.GaussianBlur(cv2.dilate(keep, np.ones((5, 5), np.uint8)), (5, 5), 0)
            b = b * cv2.resize(keep, (a.shape[1], a.shape[0]), interpolation=cv2.INTER_LINEAR)
            merged.append(np.maximum(a, b))
        mattes = merged
    write_matte(mattes, dst)
    return len(frames), w, h


def pack(colour, matte_file, dst, cut):
    L = LAYOUT[cut]
    fw, fh = L["frame"]
    cx, cy, cw, ch = L["color"]
    mx, my, mw, mh = L["matte"]
    fc = (
        f"[0:v]pad={fw}:{fh}:{cx}:{cy}:black[base];"
        f"[1:v]scale={mw}:{mh}:flags=area,format=yuv420p[m];"
        f"[base][m]overlay={mx}:{my}:format=auto,format=yuv420p[v]"
    )
    run([
        "-i", str(colour), "-i", str(matte_file), "-filter_complex", fc, "-map", "[v]",
        "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-profile:v", "high",
        "-pix_fmt", "yuv420p", "-g", "48", "-movflags", "+faststart", str(dst),
    ])


opts = ort.SessionOptions()
opts.intra_op_num_threads = 0
sess = ort.InferenceSession(str(model_path), opts, providers=["CPUExecutionProvider"])

report = {}
for c in CLIPS:
    if only and c["name"] != only:
        continue
    for cut in ("tall", "wide"):
        base = f"{c['name']}-{cut}"
        colour = work / f"{base}-colour.mp4"
        m = work / f"{base}-matte.mkv"
        colour_intermediate(c, cut, colour)
        n, w, h = matte(sess, colour, m, LAYOUT[cut]["ratio"], c.get("bgsub", False), c.get("bg_pct", 50))
        packed = out / f"{base}.mp4"
        pack(colour, m, packed, cut)
        run(["-i", str(colour), "-frames:v", "1", "-q:v", "4", str(out / f"{base}.jpg")])
        report[base] = dict(frames=n, size=f"{w}x{h}", kb=round(packed.stat().st_size / 1024))
        print(base, report[base], flush=True)

(out / "layout.json").write_text(json.dumps({k: {kk: vv for kk, vv in v.items() if kk != "ratio"} for k, v in LAYOUT.items()}, indent=1))
