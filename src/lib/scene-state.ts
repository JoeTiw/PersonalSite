// Shared, mutable state between the DOM (GSAP ScrollTrigger) and the Three.js scene.
// Kept as a plain object so the render loop can read it every frame without React re-renders.

export const FORMATIONS = ['hero', 'now', 'story', 'neo', 'work', 'craft', 'photos', 'contact'] as const
export type FormationName = (typeof FORMATIONS)[number]

export const sceneState = {
  /** Continuous formation index: 0 = hero, 1 = now, ... 7 = contact. Fractions are mid-morph. */
  formation: 0,
  /** Normalised pointer, -1..1 on both axes. */
  pointer: { x: 0, y: 0 },
  /** True when the OS asks for reduced motion. */
  reducedMotion: false,
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
