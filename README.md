# Forge Athletic Club

A demo landing page for a fictional strength and conditioning gym. It is built phone first, because most people open a gym link from WhatsApp on their phone.

**Primary action:** book a free trial class, by form or by WhatsApp.

## What's inside

- **Story-style video hero:** full-screen footage cycles through four programs like Instagram stories. Tap or swipe to switch, and pause at any time. A giant FORGE wordmark sits on the footage, and a live "next class" chip shows the next open class and its spots.
- **Scroll to lift:** a pinned section where scrolling plays one barbell rep frame by frame, with a coaching cue for each phase of the lift.
- **Stacked program cards:** four program cards with looping footage that stack on top of each other as you scroll.
- **Word-by-word tagline:** a pinned volt section where the tagline lights up one word at a time.
- **Interactive schedule:** a swipeable day picker, spots left per class, and a "Book trial" button that fills in the booking form for you.
- **Swipe carousels on phones:** coaches, results and pricing. Pricing opens on the featured plan.
- **Sticky phone bar:** a "Book free trial" button and a WhatsApp button stay in thumb reach.
- **WhatsApp link preview:** a designed share image (`public/og.jpg`) so the link looks good when you send it in a chat.

## Performance

- About 165 KB of compressed JavaScript.
- Each clip is 250 to 950 KB, with a 9:16 cut for phones and a 16:9 cut for desktop.
- Videos only download and play while they are on screen.
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

## Customize for a real gym

- **Content** (programs, schedule, coaches, prices, FAQ, testimonials, WhatsApp number): `src/lib/data.ts`
- **Footage:** replace the files in `public/video/`. Each program needs `<name>-wide.mp4`, `<name>-tall.mp4` and a `.jpg` poster for each.
- **Design tokens and text styles:** `src/index.css`
- **Booking form:** it is a front-end demo. Connect `onSubmit` in `src/components/FinalCta.tsx` to your booking system or a form service.

## Credits

- Footage from [Mixkit](https://mixkit.co) under the Mixkit free license.
- Coach photos from [Unsplash](https://unsplash.com).
- All names, prices, reviews and statistics are fictional demo content.
