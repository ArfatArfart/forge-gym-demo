/**
 * Hero compositor: draws the gym footage, a 3D FORGE wordmark, then the athlete on top.
 *
 * Each hero clip is one H.264 file holding the colour footage and a person matte side by side
 * (see README). Packing both into one stream keeps them frame perfect on every browser,
 * including iOS Safari, which has no alpha video support.
 */

export type Cut = 'tall' | 'wide'

type Rect = [number, number, number, number]
type PackLayout = { frame: [number, number]; color: Rect; matte: Rect }

/** Must match the packing script that produced public/video/hero-*.mp4. */
export const PACK: Record<Cut, PackLayout> = {
  tall: { frame: [1080, 1280], color: [0, 0, 720, 1280], matte: [720, 0, 360, 640] },
  wide: { frame: [1440, 1232], color: [0, 0, 1440, 810], matte: [0, 816, 720, 406] },
}

export type WordLayout = { top: number; height: number }

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uVidA;
uniform sampler2D uVidB;
uniform sampler2D uText;
uniform vec4 uColorRect;
uniform vec4 uMatteRect;
uniform vec2 uColorInset;
uniform vec2 uCoverScale;
uniform vec2 uCoverOffset;
uniform float uMix;
uniform float uZoomA;
uniform float uZoomB;
uniform float uHasA;
uniform vec2 uShadow;
uniform float uDim;

vec2 cover(vec2 uv, float zoom) {
  vec2 c = (uv - 0.5) / zoom + 0.5;
  return c * uCoverScale + uCoverOffset;
}
vec3 colourAt(sampler2D t, vec2 v) {
  v = clamp(v, uColorInset, 1.0 - uColorInset);
  return texture2D(t, uColorRect.xy + v * uColorRect.zw).rgb;
}
float matteAt(sampler2D t, vec2 v) {
  v = clamp(v, 0.004, 0.996);
  return texture2D(t, uMatteRect.xy + v * uMatteRect.zw).r;
}

void main() {
  vec2 vb = cover(vUv, uZoomB);
  vec3 c = colourAt(uVidB, vb);
  float m = matteAt(uVidB, vb);
  float s = matteAt(uVidB, cover(vUv - uShadow, uZoomB));
  if (uHasA > 0.5 && uMix < 0.999) {
    vec2 va = cover(vUv, uZoomA);
    c = mix(colourAt(uVidA, va), c, uMix);
    m = mix(matteAt(uVidA, va), m, uMix);
    s = mix(matteAt(uVidA, cover(vUv - uShadow, uZoomA)), s, uMix);
  }
  // Matte from video compression has soft noise near 0 and 1: tighten it slightly.
  m = smoothstep(0.08, 0.92, m);
  s = smoothstep(0.1, 0.9, s);

  vec3 scene = c * uDim;
  vec4 t = texture2D(uText, vUv);               // premultiplied
  vec3 lettering = t.rgb * (1.0 - 0.5 * s);     // the athlete's shadow falls on the letters
  vec3 behind = scene * (1.0 - t.a) + lettering;
  gl_FragColor = vec4(mix(behind, scene, m), 1.0);
}`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader')
  return sh
}

function makeTexture(gl: WebGLRenderingContext) {
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
  return tex
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

/* ───────────── 3D wordmark, drawn once per size into a 2D canvas ───────────── */

export function drawWordmark(canvas: HTMLCanvasElement, width: number, height: number, dpr: number, cut: Cut): WordLayout {
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const text = 'FORGE'
  const side = cut === 'tall' ? 12 : 32
  const target = width - side * 2
  const family = '"Manrope", system-ui, sans-serif'
  const spacing = (fs: number) => `${(-0.03 * fs).toFixed(2)}px`

  // Fit the ink box exactly to the target width.
  ctx.font = `700 200px ${family}`
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = spacing(200)
  const m0 = ctx.measureText(text)
  const ink0 = m0.actualBoundingBoxLeft + m0.actualBoundingBoxRight
  let fs = (200 * target) / ink0
  // Never taller than 30% of the hero, so the copy below always has room.
  const capRatio = m0.actualBoundingBoxAscent / 200
  fs = Math.min(fs, (height * 0.3) / capRatio)
  ctx.font = `700 ${fs}px ${family}`
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = spacing(fs)
  const m = ctx.measureText(text)
  const cap = m.actualBoundingBoxAscent
  const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
  const x = (width - inkW) / 2 + m.actualBoundingBoxLeft
  // Phones: across the athlete's head and shoulders. Desktop: where the old wordmark sat.
  const top = cut === 'tall' ? Math.max(height * 0.2, 104) : Math.max(height * 0.12, 100)
  const y = top + cap // baseline

  const depth = Math.max(fs * 0.085, 6)
  const dir = { x: 0.32, y: 1 }
  const len = Math.hypot(dir.x, dir.y)
  const ux = dir.x / len
  const uy = dir.y / len
  const steps = Math.ceil(depth * Math.min(dpr, 2))

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // 1. Soft shadow cast onto the wall behind the letters.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)'
  ctx.shadowBlur = fs * 0.18
  ctx.shadowOffsetX = depth * 0.8
  ctx.shadowOffsetY = depth * 1.6
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillText(text, x + ux * depth, y + uy * depth)
  ctx.restore()

  // 2. Extruded sides, back to front: lit graphite near the face, falling off with depth.
  for (let i = steps; i >= 1; i--) {
    const k = i / steps
    const shade = Math.round(118 - 78 * Math.pow(k, 0.8)) // 118 near the face, 40 at the back
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade - 2})`
    ctx.fillText(text, x + ux * depth * k, y + uy * depth * k)
  }

  // 3. Volt edge where the face meets the sides.
  ctx.fillStyle = '#d4ff3a'
  ctx.fillText(text, x + ux * Math.max(1.5, depth * 0.06), y + uy * Math.max(1.5, depth * 0.06))

  // 4. Face: concrete white, lit from above.
  const face = ctx.createLinearGradient(0, y - cap, 0, y)
  face.addColorStop(0, '#ffffff')
  face.addColorStop(0.55, '#e9e9e6')
  face.addColorStop(1, '#b9b9b4')
  ctx.fillStyle = face
  ctx.fillText(text, x, y)

  // 5. Fine top highlight for a machined edge.
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, y - cap - 4, width, cap * 0.18)
  ctx.clip()
  ctx.lineWidth = Math.max(1, fs * 0.006)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.strokeText(text, x, y)
  ctx.restore()

  return { top, height: cap + depth }
}

/* ───────────── WebGL renderer ───────────── */

export class HeroRenderer {
  private gl: WebGLRenderingContext
  private prog: WebGLProgram
  private texA: WebGLTexture
  private texB: WebGLTexture
  private texText: WebGLTexture
  private u: Record<string, WebGLUniformLocation | null> = {}
  private cut: Cut = 'tall'
  readonly textCanvas = document.createElement('canvas')

  constructor(private canvas: HTMLCanvasElement) {
    const gl = (canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'default' }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) throw new Error('WebGL unavailable')
    this.gl = gl
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link')
    this.prog = prog
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    for (const n of ['uVidA', 'uVidB', 'uText', 'uColorRect', 'uMatteRect', 'uColorInset', 'uCoverScale', 'uCoverOffset', 'uMix', 'uZoomA', 'uZoomB', 'uHasA', 'uShadow', 'uDim'])
      this.u[n] = gl.getUniformLocation(prog, n)

    this.texA = makeTexture(gl)
    this.texB = makeTexture(gl)
    this.texText = makeTexture(gl)
    gl.uniform1i(this.u.uVidA, 0)
    gl.uniform1i(this.u.uVidB, 1)
    gl.uniform1i(this.u.uText, 2)
    gl.uniform1f(this.u.uDim, 0.6)
  }

  /** Resizes the canvas, redraws the wordmark and updates the cover mapping. Returns the wordmark box. */
  resize(width: number, height: number, cut: Cut): WordLayout {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.cut = cut
    this.canvas.width = Math.round(width * dpr)
    this.canvas.height = Math.round(height * dpr)
    const gl = this.gl
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    const L = PACK[cut]
    const [fw, fh] = L.frame
    const [cx, cy, cw, ch] = L.color
    const [mx, my, mw, mh] = L.matte
    gl.uniform4f(this.u.uColorRect, cx / fw, cy / fh, cw / fw, ch / fh)
    gl.uniform4f(this.u.uMatteRect, mx / fw, my / fh, mw / fw, mh / fh)
    gl.uniform2f(this.u.uColorInset, 1 / cw, 1 / ch)

    // object-fit: cover
    const ca = width / height
    const va = cw / ch
    if (ca > va) {
      const s = va / ca
      gl.uniform2f(this.u.uCoverScale, 1, s)
      gl.uniform2f(this.u.uCoverOffset, 0, (1 - s) * (cut === 'wide' ? 0.35 : 0.5))
    } else {
      const s = ca / va
      gl.uniform2f(this.u.uCoverScale, s, 1)
      gl.uniform2f(this.u.uCoverOffset, (1 - s) / 2, 0)
    }
    gl.uniform2f(this.u.uShadow, 0.012 * (height / width), 0.012)

    const box = drawWordmark(this.textCanvas, width, height, dpr, cut)
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, this.texText)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textCanvas)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    return box
  }

  get currentCut() {
    return this.cut
  }

  private upload(unit: number, tex: WebGLTexture, video: HTMLVideoElement) {
    const gl = this.gl
    gl.activeTexture(unit)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
  }

  /** Draws one frame. `a` is the outgoing clip during a crossfade. */
  render(b: HTMLVideoElement, a: HTMLVideoElement | null, mix: number, zoomB: number) {
    const gl = this.gl
    if (b.readyState >= 2) this.upload(gl.TEXTURE1, this.texB, b)
    const hasA = !!a && a.readyState >= 2 && mix < 0.999
    if (hasA) this.upload(gl.TEXTURE0, this.texA, a!)
    gl.uniform1f(this.u.uHasA, hasA ? 1 : 0)
    gl.uniform1f(this.u.uMix, mix)
    gl.uniform1f(this.u.uZoomA, 1)
    gl.uniform1f(this.u.uZoomB, zoomB)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  /** Frees GPU objects. The context itself is kept, so a remount on the same canvas still works. */
  dispose() {
    const gl = this.gl
    gl.deleteTexture(this.texA)
    gl.deleteTexture(this.texB)
    gl.deleteTexture(this.texText)
    gl.deleteProgram(this.prog)
  }
}
