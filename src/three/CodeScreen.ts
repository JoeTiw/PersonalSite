import * as THREE from 'three'

/** The code that types itself on the monitor. Real logic from the Neo Office send-to-POS path, trimmed. */
const SNIPPET = [
  '// send-to-pos.ts',
  'export async function sendBatch(batch: Batch) {',
  '  for (let attempt = 1; attempt <= 5; attempt++) {',
  '    const res = await pos.apply(batch)',
  '    if (res.ok) return mark(batch, "applied")',
  '    await alerts.owner(`Batch ${batch.id} retrying`)',
  '    await sleep(backoff(attempt))',
  '  }',
  '  return mark(batch, "needs-help")',
  '}',
]

const TERMINAL = ['$ npm run build', '✓ built in 758ms', '$ git push origin main', '→ deploying bhupin.com …']

const COLORS = {
  bg: '#0f1117',
  gutter: '#2a2e3d',
  tabBar: '#161922',
  tabActive: '#0f1117',
  text: '#c0caf5',
  keyword: '#7aa2f7',
  string: '#9ece6a',
  comment: '#565f89',
  fn: '#e0af68',
  number: '#ff9e64',
  punct: '#a9b1d6',
  cursor: '#c0caf5',
  prompt: '#7dcfff',
  ok: '#9ece6a',
}

const KEYWORDS = /^(export|async|function|for|let|const|if|return|await)$/
const TOKEN = /(\/\/.*$)|("[^"]*"|`[^`]*`)|(\b\d+\b)|(\b[A-Za-z_]\w*)(?=\()|(\b[A-Za-z_]\w*\b)|(\s+)|(.)/g

type Token = { text: string; color: string }

function tokenize(line: string): Token[] {
  const out: Token[] = []
  for (const m of line.matchAll(TOKEN)) {
    const [text, comment, str, num, fn, ident] = m
    let color = COLORS.punct
    if (comment) color = COLORS.comment
    else if (str) color = COLORS.string
    else if (num) color = COLORS.number
    else if (fn) color = KEYWORDS.test(fn) ? COLORS.keyword : COLORS.fn
    else if (ident) color = KEYWORDS.test(ident) ? COLORS.keyword : COLORS.text
    out.push({ text, color })
  }
  return out
}

/**
 * A canvas-backed texture that types the snippet character by character, blinks a cursor,
 * and echoes a small terminal underneath. `update()` only redraws when something changed.
 */
export class CodeScreen {
  readonly texture: THREE.CanvasTexture
  private canvas = document.createElement('canvas')
  private ctx: CanvasRenderingContext2D
  private line = 0
  private char = 0
  private nextStep = 0
  private cursorOn = true
  private nextBlink = 0
  private termLines = 0
  private nextTerm = 0
  private done = false
  private restartAt = 0
  /** Set to true for one frame whenever a character lands, so the keyboard can react. */
  keyPressed = false
  private w: number
  private h: number

  constructor(w = 1024, h = 600) {
    this.w = w
    this.h = h
    this.canvas.width = w
    this.canvas.height = h
    this.ctx = this.canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.anisotropy = 4
    this.draw()
  }

  update(time: number): void {
    let dirty = false
    this.keyPressed = false

    if (!this.done && time >= this.nextStep) {
      const current = SNIPPET[this.line]
      if (this.char < current.length) {
        this.char++
        this.keyPressed = true
        const ch = current[this.char - 1]
        this.nextStep = time + (ch === ' ' ? 0.02 : 0.035 + Math.random() * 0.05)
      } else if (this.line < SNIPPET.length - 1) {
        this.line++
        this.char = 0
        this.nextStep = time + 0.18
      } else {
        this.done = true
        this.nextTerm = time + 0.5
        this.restartAt = time + 9
      }
      dirty = true
    }

    if (this.done && this.termLines < TERMINAL.length && time >= this.nextTerm) {
      this.termLines++
      this.nextTerm = time + 0.6 + Math.random() * 0.4
      dirty = true
    }

    if (this.done && time >= this.restartAt) {
      this.line = 0
      this.char = 0
      this.termLines = 0
      this.done = false
      this.nextStep = time + 0.4
      dirty = true
    }

    if (time >= this.nextBlink) {
      this.cursorOn = !this.cursorOn
      this.nextBlink = time + 0.5
      dirty = true
    }

    if (dirty) this.draw()
  }

  private draw() {
    const { ctx, w, h } = this
    const pad = 36
    const lineH = 34
    const font = '500 23px "Geist Mono Variable", "JetBrains Mono", Menlo, monospace'

    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, w, h)

    // tab bar
    ctx.fillStyle = COLORS.tabBar
    ctx.fillRect(0, 0, w, 52)
    ctx.fillStyle = COLORS.tabActive
    ctx.fillRect(pad, 10, 250, 42)
    ctx.font = font
    ctx.fillStyle = COLORS.text
    ctx.fillText('send-to-pos.ts', pad + 22, 39)
    ctx.fillStyle = COLORS.comment
    ctx.fillText('Field.tsx', pad + 300, 39)
    ctx.fillText('content.ts', pad + 450, 39)
    // traffic lights
    for (const [i, c] of ['#ff5f57', '#febc2e', '#28c840'].entries()) {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(w - 30 - i * 26, 26, 7, 0, Math.PI * 2)
      ctx.fill()
    }

    // editor
    const top = 100
    const gutterW = 64
    ctx.font = font
    for (let i = 0; i <= this.line; i++) {
      const y = top + i * lineH
      ctx.fillStyle = COLORS.gutter
      ctx.textAlign = 'right'
      ctx.fillText(String(i + 1), pad + gutterW - 22, y)
      ctx.textAlign = 'left'
      const full = SNIPPET[i]
      const text = i === this.line ? full.slice(0, this.char) : full
      let x = pad + gutterW
      for (const tok of tokenize(text)) {
        ctx.fillStyle = tok.color
        ctx.fillText(tok.text, x, y)
        x += ctx.measureText(tok.text).width
      }
      if (i === this.line && this.cursorOn && !this.done) {
        ctx.fillStyle = COLORS.cursor
        ctx.fillRect(x + 2, y - 22, 12, 28)
      }
    }

    // terminal
    const termTop = h - 150
    ctx.fillStyle = COLORS.tabBar
    ctx.fillRect(0, termTop, w, h - termTop)
    ctx.fillStyle = COLORS.gutter
    ctx.fillRect(0, termTop, w, 2)
    ctx.font = '500 21px "Geist Mono Variable", "JetBrains Mono", Menlo, monospace'
    for (let i = 0; i < this.termLines; i++) {
      const t = TERMINAL[i]
      ctx.fillStyle = t.startsWith('$') ? COLORS.prompt : t.startsWith('✓') ? COLORS.ok : COLORS.text
      ctx.fillText(t, pad, termTop + 42 + i * 30)
    }
    if (this.done && this.termLines < TERMINAL.length && this.cursorOn) {
      ctx.fillStyle = COLORS.cursor
      ctx.fillRect(pad, termTop + 22 + this.termLines * 30, 11, 24)
    }

    this.texture.needsUpdate = true
  }

  dispose() {
    this.texture.dispose()
  }
}
