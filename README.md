# bhupin.com

Personal site of Bhupin Tiwari. One page, scroll-driven, with an instanced Three.js field that morphs between a formation per chapter.

## Stack

- Vite + React 19 + TypeScript
- Three.js via React Three Fiber (the particle field in `src/three`)
- GSAP 3.15 with ScrollTrigger and SplitText, Lenis for smooth scrolling
- Motion for the Neo Office screen transitions
- Fonts self-hosted through Fontsource: Instrument Serif, Geist, Geist Mono

## Develop

```bash
npm install
npm run dev
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds `dist/` and publishes it to GitHub Pages. `public/CNAME` pins the custom domain. The build also copies `index.html` to `404.html` so unknown paths still load the page.

## Edit the words

All copy lives in `src/data/content.ts`: the founder story chapters, the Neo Office steps, the six projects, the principles, the tools marquee, and the photo captions.

## Credits

Photography by Bhupin Tiwari. The previous versions of this site live on the `legacy-cra` branch and in the `3DPersonalWebsite` repository.
