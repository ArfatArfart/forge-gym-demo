# Forge Athletic Club

A demo landing page for a fictional strength and conditioning gym. It is built phone first, because most people open a gym link from WhatsApp on their phone.

**Primary action:** book a free trial class, by form or by WhatsApp.

## What's inside

- **Story-style video hero with depth:** full-screen footage cycles through four programs like Instagram stories. Tap or swipe to switch, and pause at any time. A large 3D FORGE wordmark sits *behind* the athlete: the athlete's body, and any moving equipment, pass in front of the letters and cast a soft shadow on them. A live "next class" chip shows the next open class and its spots.
- **Scroll to lift:** a pinned section where scrolling plays one barbell rep frame by frame, with a coaching cue for each phase of the lift. Phones scrub an image sequence on a canvas (`public/video/rep-seq/`), crossfading between frames, because seeking a video on scroll is unreliable on iPhone. Larger screens scrub the video.
- **Stacked program cards:** four program cards with looping footage that stack on top of each other as you scroll. Phones show the full 16:9 shot.
- **Word-by-word tagline:** a pinned volt section where the tagline lights up one word at a time.
- **Interactive schedule:** a swipeable day picker, spots left per class, and a "Book trial" button that fills in the booking form for you.
- **Swipe carousels on phones:** coaches, results and pricing. Pricing opens on the featured plan.
- **Sticky phone bar:** a "Book free trial" button and a WhatsApp button stay in thumb reach.
- **WhatsApp link preview:** a designed share image (`public/og.jpg`) so the link looks good when you send it in a chat.

## Performance

- About 165 KB of compressed JavaScript.
- Hero clips are 0.9 to 1.6 MB, other clips 250 to 950 KB. Each comes in a 9:16 cut for phones and a 16:9 cut for desktop.
- The phone rep sequence is 92 WebP frames (2.2 MB). It starts loading shortly before the section comes into view, coarse frames first, so scrubbing works almost immediately. Data saver loads every fourth frame.
- Videos only download and play while they are on screen, and only the front card in the program stack plays.
- Data saver and reduced motion users get still poster images instead of video.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Motion · Lenis · Phosphor Icons · Manrope and Geist Mono

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. Set it up once: in the repo, go to **Settings → Pages → Source** and choose **GitHub Actions**. The base path follows the repository name automatically.

## How the hero depth effect works

Each hero clip (`public/video/hero-<program>-<tall|wide>.mp4`) is a single H.264 video. Every frame holds two things side by side:

- the colour footage, and
- a half-resolution mask of the athlete.

At runtime, a small WebGL compositor (`src/lib/heroGL.ts`) draws three layers in order: the footage, then a 3D wordmark it renders once per screen size, then the athlete, cut out with the mask. Keeping the footage and the mask in one stream keeps them perfectly in sync. It also works on iPhone Safari, which can't play transparent video. Browsers without WebGL, and visitors with Data Saver on, get a plain video fallback.

The masks are made offline by `tools/hero-matte.py`:

- **Person mask:** [RobustVideoMatting](https://github.com/PeterL1n/RobustVideoMatting), run with ONNX Runtime.
- **Equipment:** for tripod shots, it also adds background subtraction, so barbells and plates count as foreground.

To regenerate with new footage:

```bash
pip install onnxruntime opencv-python-headless numpy
# download rvm_resnet50_fp32.onnx from the RobustVideoMatting releases page
python tools/hero-matte.py <raw_clips_dir> <work_dir> <out_dir> <path/to/ffmpeg> rvm_resnet50_fp32.onnx
```

Then copy each `<out_dir>/<name>-<cut>.mp4` and `.jpg` to `public/video/hero-<name>-<cut>.*`. The pack layout in the script must match `PACK` in `src/lib/heroGL.ts`.

## Customize for a real gym

- **Content** (programs, schedule, coaches, prices, FAQ, testimonials, WhatsApp number): `src/lib/data.ts`
- **Footage:** replace the files in `public/video/`. Each program needs `<name>-wide.mp4`, `<name>-tall.mp4` and a `.jpg` poster for each.
- **Design tokens and text styles:** `src/index.css`
- **Booking form:** it is a front-end demo. Connect `onSubmit` in `src/components/FinalCta.tsx` to your booking system or a form service.

## Credits

- Footage from [Mixkit](https://mixkit.co) under the Mixkit free license.
- Coach photos from [Unsplash](https://unsplash.com).
- All names, prices, reviews and statistics are fictional demo content.
