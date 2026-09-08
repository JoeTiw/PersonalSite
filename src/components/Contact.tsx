import { site } from '../data/content'
import { Fade, Reveal } from './Reveal'

export function Contact() {
  return (
    <section className="contact" id="contact" data-chapter="08 · Contact">
      <div className="container">
        <Fade as="p" className="eyebrow">Contact</Fade>
        <Reveal as="h2" className="contact-title">Let’s build <em>something</em> for your business.</Reveal>
        <div className="contact-row">
          <div>
            <Fade as="p" className="measure" delay={0.1}>
              Running a store, a shop, or a small company and tired of software that was not built for you? Or just want to
              talk shop about Three.js and point-of-sale hardware? Either works.
            </Fade>
            <p style={{ marginTop: 28 }}>
              <a className="contact-email" href={`mailto:${site.email}`} data-cursor="link">{site.email}</a>
            </p>
          </div>
          <div className="contact-links">
            <a href={site.github} target="_blank" rel="noreferrer" data-cursor="link">GitHub</a>
            <a href={site.company} target="_blank" rel="noreferrer" data-cursor="link">Neogen Technologies</a>
            <a href={`mailto:${site.email}`} data-cursor="link">Email</a>
          </div>
        </div>
      </div>
      <div className="container">
        <footer className="footer mono">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>{site.location}</span>
          <span>React · Three.js · GSAP · hosted on GitHub Pages</span>
        </footer>
      </div>
    </section>
  )
}
