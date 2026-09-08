import { FORMATIONS } from '../lib/scene-state'

/** Deterministic PRNG so the field looks the same on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Writer = (i: number, x: number, y: number, z: number) => void

function rotateX(y: number, z: number, a: number): [number, number] {
  return [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
}
function rotateY(x: number, z: number, a: number): [number, number] {
  return [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)]
}

/**
 * One Float32Array (xyz per instance) per chapter of the page.
 * Formations are centred; the Field group positions them in the viewport.
 */
export function buildFormations(n: number, _ox = 0): Float32Array[] {
  void _ox
  const rand = mulberry32(1337)
  const out: Float32Array[] = []
  const make = (fill: (w: Writer) => void) => {
    const arr = new Float32Array(n * 3)
    fill((i, x, y, z) => {
      arr[i * 3] = x
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = z
    })
    out.push(arr)
  }
  const golden = Math.PI * (3 - Math.sqrt(5))

  // 0 · hero: a breathing sphere shell, slightly roughened
  make((w) => {
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      const rad = 1.9 + (rand() - 0.5) * 0.5
      w(i, Math.cos(th) * r * rad, y * rad + 0.45, Math.sin(th) * r * rad)
    }
  })

  // 1 · now: a tilted ring
  make((w) => {
    for (let i = 0; i < n; i++) {
      const u = rand() * Math.PI * 2
      const v = rand() * Math.PI * 2
      const R = 1.75
      const r = 0.36
      let x = (R + r * Math.cos(v)) * Math.cos(u)
      let y = (R + r * Math.cos(v)) * Math.sin(u)
      let z = r * Math.sin(v)
      ;[y, z] = rotateX(y, z, 1.05)
      ;[x, z] = rotateY(x, z, -0.35)
      w(i, x, y * 0.9 + 0.2, z)
    }
  })

  // 2 · story: a long timeline path with four milestone clusters
  make((w) => {
    const milestones = [-4.6, -1.55, 1.55, 4.6]
    for (let i = 0; i < n; i++) {
      if (i % 5 === 0) {
        const m = milestones[Math.floor(rand() * milestones.length)]
        const th = rand() * Math.PI * 2
        const ph = Math.acos(2 * rand() - 1)
        const r = 0.55 * Math.cbrt(rand())
        w(i, m + r * Math.sin(ph) * Math.cos(th), -2.3 + r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th))
      } else {
        const x = -7 + 14 * rand()
        w(i, x, -2.3 + Math.sin(x * 0.9) * 0.18 + (rand() - 0.5) * 0.14, (rand() - 0.5) * 0.5)
      }
    }
  })

  // 3 · neo: a tilted grid, like a dashboard laid on a counter
  make((w) => {
    const cols = Math.ceil(Math.sqrt(n * 1.6))
    const rows = Math.ceil(n / cols)
    const s = 0.105
    for (let i = 0; i < n; i++) {
      const c = i % cols
      const r = Math.floor(i / cols)
      let x = (c - cols / 2) * s
      let y = (r - rows / 2) * s
      let z = Math.sin(c * 0.35) * 0.08 + Math.cos(r * 0.5) * 0.06
      ;[y, z] = rotateX(y, z, -0.95)
      ;[x, z] = rotateY(x, z, 0.28)
      w(i, x, y + 0.1, z)
    }
  })

  // 4 · work: six stacked plates
  make((w) => {
    const plates = 6
    for (let i = 0; i < n; i++) {
      const k = i % plates
      let x = (rand() - 0.5) * 2.2 + k * 0.18
      let y = (rand() - 0.5) * 1.4 + k * 0.14
      let z = (k - (plates - 1) / 2) * 0.55
      ;[x, z] = rotateY(x, z, 0.55)
      ;[y, z] = rotateX(y, z, -0.25)
      w(i, x, y + 1.1, z)
    }
  })

  // 5 · craft: a double helix
  make((w) => {
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 7
      const strand = i % 2 === 0 ? 0 : Math.PI
      const r = 0.8
      const y = (i / n) * 6.4 - 3.2
      let x = Math.cos(t + strand) * r
      let z = Math.sin(t + strand) * r
      ;[x, z] = rotateY(x, z, 0.2)
      w(i, x, y, z)
    }
  })

  // 6 · photos: scattered, like a wall of prints
  make((w) => {
    for (let i = 0; i < n; i++) {
      w(i, (rand() - 0.5) * 11, (rand() - 0.5) * 6, -2.5 - rand() * 2.5)
    }
  })

  // 7 · contact: everything gathers into one dense core
  make((w) => {
    for (let i = 0; i < n; i++) {
      const th = rand() * Math.PI * 2
      const ph = Math.acos(2 * rand() - 1)
      const r = 1.0 * Math.cbrt(rand())
      w(i, r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) + 0.9, r * Math.sin(ph) * Math.sin(th))
    }
  })

  if (out.length !== FORMATIONS.length) throw new Error('formation count mismatch')
  return out
}
