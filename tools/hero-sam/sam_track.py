"""
Tracks the athlete and every piece of equipment through a hero clip with SAM 2.1.

Usage: python sam_track.py <frames_dir> <prompts.json> <out_dir> <checkpoint>

prompts.json: [{"frame": 0, "obj": 1, "box": [x0, y0, x1, y1], "points": [[x, y, 1], [x, y, 0]]}, ...]
Writes <out_dir>/<obj>/<frame>.png: per object probability (0 to 255), merged from a forward and a
reverse pass so objects first prompted mid clip are also tracked back to frame 0.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
import torch
from sam2.build_sam import build_sam2_video_predictor

frames_dir, prompts_path, out_dir, ckpt = sys.argv[1], sys.argv[2], Path(sys.argv[3]), sys.argv[4]
prompts = json.loads(Path(prompts_path).read_text())
out_dir.mkdir(parents=True, exist_ok=True)

predictor = build_sam2_video_predictor("configs/sam2.1/sam2.1_hiera_l.yaml", ckpt, device="cuda")

probs: dict[int, dict[int, np.ndarray]] = {}


def collect(gen):
    for f, obj_ids, logits in gen:
        for k, o in enumerate(obj_ids):
            p = torch.sigmoid(logits[k, 0]).float().cpu().numpy()
            p8 = (p * 255 + 0.5).astype(np.uint8)
            d = probs.setdefault(int(o), {})
            d[f] = p8 if f not in d else np.maximum(d[f], p8)


with torch.inference_mode(), torch.autocast("cuda", dtype=torch.bfloat16):
    state = predictor.init_state(video_path=frames_dir, offload_video_to_cpu=True, offload_state_to_cpu=True)
    for p in prompts:
        pts = p.get("points") or []
        predictor.add_new_points_or_box(
            state,
            frame_idx=p["frame"],
            obj_id=p["obj"],
            points=np.array([q[:2] for q in pts], np.float32) if pts else None,
            labels=np.array([q[2] for q in pts], np.int32) if pts else None,
            box=np.array(p["box"], np.float32) if p.get("box") else None,
        )
    first = min(p["frame"] for p in prompts)
    collect(predictor.propagate_in_video(state, start_frame_idx=first))
    collect(predictor.propagate_in_video(state, start_frame_idx=max(p["frame"] for p in prompts), reverse=True))

for o, frames in probs.items():
    d = out_dir / str(o)
    d.mkdir(exist_ok=True)
    for f, m in frames.items():
        cv2.imwrite(str(d / f"{f:05d}.png"), m)
    print("object", o, "frames", len(frames), flush=True)
print("peak GPU MB", round(torch.cuda.max_memory_allocated() / 2**20))
