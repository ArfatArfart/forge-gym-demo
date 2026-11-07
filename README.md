# Forge Athletic Club

A demo landing page for a fictional strength and conditioning gym in Portland. It is built to show what a modern, conversion-focused gym website can look like.

**Primary action:** book a free trial class.

## Highlights

- **Real-time 3D hero** (Three.js via React Three Fiber): a cast iron kettlebell modeled entirely in code, lit by a virtual photo studio, with GPU forge sparks, a reflective floor, bloom and film grain. It reacts to the pointer and to scroll.
- **Scroll storytelling:** a pinned tagline that lights up word by word, a pinned horizontal gallery and count-up stats.
- **Interactive schedule:** day tabs, live spot availability, and a "Book trial" button that pre-fills the booking form.
- **Booking form:** inline validation, a loading state, a success state and keyboard support.
- **Accessible:** skip link, focus rings, semantic landmarks, ARIA tabs and accordion, and `prefers-reduced-motion` support throughout.
- **Production details:** SEO meta tags, Open Graph image, JSON-LD for the gym and FAQ, privacy and terms pages, a branded 404 and a favicon.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · React Three Fiber, drei and postprocessing · Motion · Lenis · Phosphor Icons · Geist

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. In the repo, go to **Settings → Pages → Source** and choose **GitHub Actions** once. The base path follows the repository name automatically.

## Customize

- Content (schedule, coaches, prices, FAQ, testimonials): `src/lib/data.ts`
- Design tokens and text styles: `src/index.css`
- 3D scene: `src/scene/HeroScene.tsx`
- The booking form is a front-end demo. Connect `onSubmit` in `src/components/FinalCta.tsx` to your booking system or a form service.

## Credits

Photos from [Unsplash](https://unsplash.com). All names, prices, reviews and statistics are fictional demo content.
