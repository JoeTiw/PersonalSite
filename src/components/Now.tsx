import { Suspense, lazy } from 'react'
import { site } from '../data/content'
import { Fade, Reveal } from './Reveal'

const Portrait = lazy(() => import('../three/Portrait'))

const items = [
  {
    k: 'Company',
    title: 'Neogen Technologies',
    body: `Co-founded with my brother ${site.brother} to help small businesses with any tech work they need. I run it and still ship code most days.`,
  },
  {
    k: 'Product',
    title: 'Neo Office',
    body: 'The modern back office for gas stations and convenience stores, built around the point of sale the store already runs.',
  },
  {
    k: 'Base',
    title: 'Appleton, Wisconsin',
    body: 'Born in Nepal, raised in Appleton. Most of our first stores are within a tank of gas of here.',
  },
]

export function Now() {
  return (
    <section className="section-pad" id="now" data-chapter="01 · Now">
      <div className="container now-grid">
        <div>
          <div className="section-head">
            <Fade as="p" className="eyebrow">What I do now</Fade>
            <Reveal as="h2">Engineer first, <em>founder</em> by necessity.</Reveal>
          </div>
          <div className="now-list" style={{ marginTop: 40 }}>
            {items.map((it, i) => (
              <Fade key={it.k} className="now-item" delay={i * 0.08}>
                <span className="mono now-k">{it.k}</span>
                <div>
                  <h3>{it.title}</h3>
                  <p>{it.body}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
        <Fade as="figure" className="now-portrait" delay={0.15}>
          <Suspense
            fallback={
              <>
                <img src="/img/portrait.webp" alt="Bhupin Tiwari" width={900} height={900} loading="lazy" decoding="async" />
                <figcaption className="mono">Bhupin, 2023</figcaption>
              </>
            }
          >
            <Portrait src="/img/portrait.webp" caption="Bhupin, 2023" />
          </Suspense>
        </Fade>
      </div>
    </section>
  )
}
