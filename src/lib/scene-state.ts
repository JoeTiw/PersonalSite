// Shared, mutable state between the DOM (GSAP ScrollTrigger) and the Three.js scene.
// Kept as a plain object so the render loop can read it every frame without React re-renders.

export const sceneState = {
  /** 0 while the hero is fully in view, 1 once it has scrolled away. */
  heroProgress: 0,
  /** Normalised pointer, -1..1 on both axes. */
  pointer: { x: 0, y: 0 },
  /** True when the OS asks for reduced motion. */
  reducedMotion: false,
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
