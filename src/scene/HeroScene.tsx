import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import type { MotionValue } from 'motion/react'

type Props = {
  progress: MotionValue<number>
  active: boolean
  reduced: boolean
  onReady: () => void
}

const EMBER = '#ff6a1a'

export default function HeroScene({ progress, active, reduced, onReady }: Props) {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768
  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.35, 6.5], fov: 35, near: 0.1, far: 40 }}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false }}
      aria-hidden="true"
    >
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 7, 15]} />
      <Studio />
      <Kettlebell progress={progress} reduced={reduced} />
      <Sparks count={mobile ? 110 : 260} reduced={reduced} />
      {!mobile && <Floor />}
      <CameraRig reduced={reduced || mobile} />
      <ReadySignal onReady={onReady} />
      <EffectComposer multisampling={mobile ? 0 : 4}>
        <Bloom mipmapBlur luminanceThreshold={0.82} luminanceSmoothing={0.2} intensity={1.1} radius={0.72} />
        <Noise opacity={0.028} />
        <Vignette offset={0.22} darkness={0.82} />
      </EffectComposer>
    </Canvas>
  )
}

/* ─────────────── Lighting: a virtual photo studio ─────────────── */
function Studio() {
  return (
    <>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[0, 5, 2]} scale={[9, 1.4, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[-5, 1.5, 3]} scale={[1.1, 7, 1]} />
        <Lightformer form="rect" intensity={0.7} position={[5, 0.5, 3]} scale={[0.8, 5, 1]} />
        <Lightformer form="circle" color={EMBER} intensity={6} position={[4.5, 1.2, -4]} scale={3.2} />
        <Lightformer form="rect" color="#ff5a10" intensity={2.4} position={[-3, -2.2, -5]} scale={[7, 1.4, 1]} />
      </Environment>
      <directionalLight position={[-3, 5, 4]} intensity={1.1} />
      <pointLight position={[2.6, 0.6, -2.4]} color={EMBER} intensity={28} distance={9} decay={2} />
    </>
  )
}

/* ─────────────── Kettlebell, modeled from code ─────────────── */
function useKettlebellGeometry() {
  return useMemo(() => {
    // Body: a lathe around Y with a flat base and a slightly flattened shoulder.
    const pts: THREE.Vector2[] = []
    const baseY = -0.86
    const baseR = Math.sqrt(1 - baseY * baseY)
    pts.push(new THREE.Vector2(0, baseY))
    pts.push(new THREE.Vector2(baseR * 0.82, baseY))
    pts.push(new THREE.Vector2(baseR * 0.96, baseY + 0.015))
    const start = Math.asin(baseY)
    const end = Math.PI / 2
    const steps = 72
    for (let i = 1; i <= steps; i++) {
      const a = start + (end - start) * (i / steps)
      const x = Math.cos(a)
      let y = Math.sin(a)
      if (y > 0) y *= 0.92
      pts.push(new THREE.Vector2(Math.max(x, 0.0001), y))
    }
    const body = new THREE.LatheGeometry(pts, 112)
    body.computeVertexNormals()

    // Handle: one continuous tube whose ends sink into the body.
    const curve = new THREE.CatmullRomCurve3(
      [
        [-0.5, 0.6],
        [-0.69, 1.0],
        [-0.68, 1.48],
        [-0.43, 1.8],
        [0, 1.9],
        [0.43, 1.8],
        [0.68, 1.48],
        [0.69, 1.0],
        [0.5, 0.6],
      ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
      false,
      'centripetal',
    )
    const handle = new THREE.TubeGeometry(curve, 180, 0.15, 36, false)
    return { body, handle }
  }, [])
}

function useIronMaterial() {
  return useMemo(() => {
    // Fine speckle used for both roughness and bump: reads as powder coated cast iron.
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')!
    const img = ctx.createImageData(size, size)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 175 + Math.random() * 60
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(6, 3)
    return new THREE.MeshPhysicalMaterial({
      color: '#1a1a1a',
      metalness: 0.9,
      roughness: 0.55,
      roughnessMap: tex,
      bumpMap: tex,
      bumpScale: 0.12,
      clearcoat: 0.5,
      clearcoatRoughness: 0.35,
      envMapIntensity: 1.3,
    })
  }, [])
}

function Kettlebell({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const { body, handle } = useKettlebellGeometry()
  const material = useIronMaterial()
  const spin = useRef(0.55)
  const born = useRef<number | null>(null)
  const viewport = useThree((s) => s.viewport)
  const width = useThree((s) => s.size.width)
  const mobile = width < 768

  useFrame((state, dt) => {
    if (!outer.current || !inner.current) return
    const t = state.clock.elapsedTime
    if (born.current === null) born.current = t
    const k = Math.min((t - born.current) / 2.4, 1)
    const e = reduced ? 1 : 1 - Math.pow(1 - k, 4) // decelerates into place
    const p = progress.get()
    if (!reduced) spin.current += dt * 0.22

    const baseX = mobile ? 0 : Math.min(viewport.width * 0.23, 2.4)
    const baseY = mobile ? 1.0 : 0.12
    const bob = reduced ? 0 : Math.sin(t * 0.9) * 0.06

    outer.current.position.set(baseX, baseY - (1 - e) * 1.8 + p * 1.6 + bob, 0)
    outer.current.rotation.y = spin.current + p * Math.PI * 1.1 - (1 - e) * 1.4
    outer.current.scale.setScalar((mobile ? 0.42 : 0.74) * (0.9 + 0.1 * e))

    const px = reduced ? 0 : state.pointer.x
    const py = reduced ? 0 : state.pointer.y
    inner.current.rotation.x = THREE.MathUtils.damp(inner.current.rotation.x, -py * 0.18 + p * 0.4, 3, dt)
    inner.current.rotation.z = THREE.MathUtils.damp(inner.current.rotation.z, -px * 0.12, 3, dt)
  })

  return (
    <group ref={outer}>
      <group ref={inner}>
        <group position={[0, -0.55, 0]}>
          <mesh geometry={body} material={material} />
          <mesh geometry={handle} material={material} />
        </group>
      </group>
    </group>
  )
}

/* ─────────────── Forge sparks: GPU particles ─────────────── */
const sparkVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aVel;
  attribute float aLife;
  attribute float aOffset;
  attribute float aScale;
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float age = mod(uTime + aOffset, aLife);
    float t = age / aLife;
    vec3 p = position + aVel * age;
    p.x += sin(uTime * 1.3 + aOffset * 6.0) * 0.12 * t;
    p.z += cos(uTime * 1.1 + aOffset * 4.0) * 0.08 * t;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio * (1.0 - t * 0.65) / -mv.z;
    vAlpha = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.5, 1.0, t));
    vHeat = 1.0 - t;
  }
`

const sparkFragment = /* glsl */ `
  uniform vec3 uHot;
  uniform vec3 uCool;
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 2.2);
    vec3 col = mix(uCool, uHot, vHeat) * (1.0 + vHeat * 1.6);
    gl_FragColor = vec4(col, a * vAlpha);
  }
`

function Sparks({ count, reduced }: { count: number; reduced: boolean }) {
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const life = new Float32Array(count)
    const offset = new Float32Array(count)
    const scale = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8
      pos[i * 3 + 1] = -1.7 + Math.random() * 0.5
      pos[i * 3 + 2] = -3.2 + Math.random() * 3.6
      vel[i * 3] = (Math.random() - 0.5) * 0.25
      vel[i * 3 + 1] = 0.3 + Math.random() * 0.75
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.15
      life[i] = 3 + Math.random() * 5
      offset[i] = Math.random() * 20
      scale[i] = 0.35 + Math.random() * 1.25
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aVel', new THREE.BufferAttribute(vel, 3))
    g.setAttribute('aLife', new THREE.BufferAttribute(life, 1))
    g.setAttribute('aOffset', new THREE.BufferAttribute(offset, 1))
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 6 },
        uSize: { value: 42 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uHot: { value: new THREE.Color('#ffd28a') },
        uCool: { value: new THREE.Color('#ff4a0a') },
      },
      vertexShader: sparkVertex,
      fragmentShader: sparkFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geometry: g, material: m }
  }, [count])

  useFrame((_, dt) => {
    if (!reduced) material.uniforms.uTime.value += Math.min(dt, 0.05)
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}

/* ─────────────── Polished concrete floor ─────────────── */
function Floor() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.2, 0]}>
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial
        blur={[400, 120]}
        resolution={1024}
        mixBlur={1}
        mixStrength={9}
        roughness={1}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.3}
        color="#080808"
        metalness={0.6}
        mirror={0.5}
      />
    </mesh>
  )
}

function CameraRig({ reduced }: { reduced: boolean }) {
  useFrame((state, dt) => {
    const cam = state.camera
    const tx = reduced ? 0 : state.pointer.x * 0.28
    const ty = reduced ? 0.35 : 0.35 + state.pointer.y * 0.16
    cam.position.x = THREE.MathUtils.damp(cam.position.x, tx, 2.5, dt)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, ty, 2.5, dt)
    cam.lookAt(0, 0, 0)
  })
  return null
}

/** Signals readiness after a few rendered frames so the canvas fades in fully lit. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    frames.current += 1
    if (frames.current > 3) {
      done.current = true
      onReady()
    }
  })
  return null
}
