import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import './GroceryScroll.css'

const clamp = THREE.MathUtils.clamp
const lerp = THREE.MathUtils.lerp

function smoothstep(start, end, value) {
  const t = clamp((value - start) / (end - start), 0, 1)
  return t * t * (3 - 2 * t)
}

/* ---------- 3D object helpers ---------- */

function material(color, roughness = 0.55) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
  })
}

function mesh(parent, geometry, mat, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, mat)
  object.position.set(...position)
  parent.add(object)
  return object
}

function box(parent, dimensions, mat, position) {
  return mesh(
    parent,
    new THREE.BoxGeometry(...dimensions),
    mat,
    position,
  )
}

function sphere(parent, radius, mat, position, scale = [1, 1, 1]) {
  const object = mesh(
    parent,
    new THREE.SphereGeometry(radius, 28, 20),
    mat,
    position,
  )

  object.scale.set(...scale)
  return object
}

/* ---------- Shopping basket ---------- */

function createBasket() {
  const basket = new THREE.Group()

  const darkGreen = material('#234a35')
  const lightGreen = material('#507657')
  const handleMaterial = material('#caaa70')

  // Solid bottom.
  box(basket, [2.5, 0.14, 1.55], darkGreen, [0, -0.75, 0])

  // Horizontal rails on the front and back.
  for (const z of [-0.78, 0.78]) {
    for (let row = 0; row < 5; row += 1) {
      const y = -0.62 + row * 0.235

      box(basket, [2.64, 0.09, 0.095], lightGreen, [0, y, z])
    }

    // Vertical slats leave gaps through which groceries are visible.
    for (let column = 0; column < 11; column += 1) {
      const x = -1.22 + column * 0.244

      box(basket, [0.075, 1.08, 0.1], darkGreen, [x, -0.19, z])
    }
  }

  // Left and right sides.
  for (const x of [-1.28, 1.28]) {
    for (let row = 0; row < 5; row += 1) {
      const y = -0.62 + row * 0.235

      box(basket, [0.1, 0.09, 1.6], lightGreen, [x, y, 0])
    }

    for (let column = 0; column < 7; column += 1) {
      const z = -0.7 + column * (1.4 / 6)

      box(basket, [0.1, 1.08, 0.075], darkGreen, [x, -0.19, z])
    }
  }

  // Thicker top rim.
  for (const z of [-0.79, 0.79]) {
    box(basket, [2.76, 0.14, 0.15], darkGreen, [0, 0.38, z])
  }

  for (const x of [-1.31, 1.31]) {
    box(basket, [0.15, 0.14, 1.7], darkGreen, [x, 0.38, 0])
  }

  // Two arched handles.
  for (const z of [-0.56, 0.56]) {
    const points = []

    for (let i = 0; i <= 40; i += 1) {
      const angle = Math.PI * (i / 40)

      points.push(
        new THREE.Vector3(
          Math.cos(angle) * 1.04,
          0.4 + Math.sin(angle) * 0.83,
          z,
        ),
      )
    }

    const curve = new THREE.CatmullRomCurve3(points)

    mesh(
      basket,
      new THREE.TubeGeometry(curve, 40, 0.045, 10, false),
      handleMaterial,
    )
  }

  return basket
}

/* ---------- Groceries ---------- */

function createApple() {
  const group = new THREE.Group()
  const red = material('#db3e30', 0.3)

  sphere(group, 0.32, red, [-0.1, 0, 0], [0.9, 1, 1])
  sphere(group, 0.32, red, [0.1, 0, 0], [0.9, 1, 1])

  const stem = mesh(
    group,
    new THREE.CylinderGeometry(0.025, 0.035, 0.19, 10),
    material('#755133'),
    [0, 0.35, 0],
  )

  stem.rotation.z = -0.2

  const leaf = sphere(
    group,
    0.16,
    material('#47713a'),
    [0.13, 0.39, 0],
    [1, 0.18, 0.48],
  )

  leaf.rotation.z = 0.35

  return group
}

function createCarrot() {
  const group = new THREE.Group()

  const carrot = mesh(
    group,
    new THREE.ConeGeometry(0.19, 0.95, 24),
    material('#f38725'),
  )

  // ConeGeometry points upward by default.
  carrot.rotation.z = Math.PI

  const greens = material('#3f803d')

  for (let i = 0; i < 5; i += 1) {
    const leaf = sphere(
      group,
      0.2,
      greens,
      [(i - 2) * 0.055, 0.57, 0],
      [0.25, 1.2, 0.3],
    )

    leaf.rotation.z = (i - 2) * -0.25
  }

  group.rotation.z = -0.2

  return group
}

function createBroccoli() {
  const group = new THREE.Group()

  mesh(
    group,
    new THREE.CylinderGeometry(0.1, 0.14, 0.6, 12),
    material('#8eaf59'),
    [0, -0.16, 0],
  )

  const greens = [
    material('#32643b'),
    material('#427e42'),
    material('#548c46'),
  ]

  const crowns = [
    [0, 0.28, 0],
    [-0.24, 0.18, 0.02],
    [0.24, 0.2, 0],
    [0, 0.2, 0.22],
    [0, 0.2, -0.2],
  ]

  crowns.forEach((position, index) => {
    sphere(group, 0.24, greens[index % greens.length], position)

    // Small rounded florets add surface detail.
    for (let j = 0; j < 6; j += 1) {
      const angle = (j / 6) * Math.PI * 2

      sphere(
        group,
        0.075,
        greens[(index + j) % greens.length],
        [
          position[0] + Math.cos(angle) * 0.17,
          position[1] + 0.14,
          position[2] + Math.sin(angle) * 0.17,
        ],
      )
    }
  })

  return group
}

function createMilk() {
  const group = new THREE.Group()
  const white = material('#fffdf1', 0.3)
  const green = material('#32664a')

  // Bottle profile, revolved around its vertical axis.
  const profile = [
    [0, -0.55],
    [0.2, -0.55],
    [0.23, -0.48],
    [0.23, 0.22],
    [0.2, 0.34],
    [0.11, 0.44],
    [0.11, 0.57],
    [0, 0.57],
  ].map(([x, y]) => new THREE.Vector2(x, y))

  mesh(group, new THREE.LatheGeometry(profile, 36), white)

  mesh(
    group,
    new THREE.CylinderGeometry(0.125, 0.125, 0.11, 24),
    green,
    [0, 0.6, 0],
  )

  // Label band.
  mesh(
    group,
    new THREE.CylinderGeometry(0.234, 0.234, 0.32, 36),
    green,
    [0, -0.04, 0],
  )

  return group
}

function createBread() {
  const group = new THREE.Group()

  sphere(
    group,
    0.38,
    material('#d69b50'),
    [0, 0, 0],
    [0.75, 1.85, 0.7],
  )

  const scoring = material('#f2cd8d')

  for (let i = 0; i < 4; i += 1) {
    const score = sphere(
      group,
      0.12,
      scoring,
      [0, -0.36 + i * 0.24, 0.245],
      [1.4, 0.18, 0.2],
    )

    score.rotation.z = -0.38
  }

  return group
}

/* ---------- React component ---------- */

export default function GroceryScroll({
  targetId = 'products',
  stickyOffset = 0,
}) {
  const sectionRef = useRef(null)
  const canvasHostRef = useRef(null)

  const [phase, setPhase] = useState(0)
  const [unavailable, setUnavailable] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const host = canvasHostRef.current

    if (!section || !host) return undefined

    const motionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    let reduceMotion = motionQuery.matches
    setReducedMotion(reduceMotion)
    setUnavailable(false)

    let renderer

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      setUnavailable(true)
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2

    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50)
    camera.position.set(0, 2.5, 8.7)
    camera.lookAt(0, 0.2, 0)

    scene.add(new THREE.HemisphereLight('#fff9e8', '#577151', 2.7))

    const keyLight = new THREE.DirectionalLight('#ffffff', 3.2)
    keyLight.position.set(-3, 5, 5)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight('#ffe2a2', 2)
    rimLight.position.set(4, 2, -3)
    scene.add(rimLight)

    // Basket and food share this group so they rotate together.
    const arrangement = new THREE.Group()
    arrangement.rotation.y = -0.16
    scene.add(arrangement)

    arrangement.add(createBasket())

    const definitions = [
      {
        object: createApple(),
        from: [-4.8, 2.8, 0],
        to: [-0.7, 0.32, 0.3],
        rotation: [0.08, 0.1, 0.1],
      },
      {
        object: createCarrot(),
        from: [4.8, 2.6, -0.4],
        to: [0.65, 0.44, 0.15],
        rotation: [0, 0, -0.4],
      },
      {
        object: createBroccoli(),
        from: [-3.5, 4, -1],
        to: [-0.72, 0.63, -0.28],
        rotation: [0.05, 0, 0.15],
      },
      {
        object: createMilk(),
        from: [3.8, 4.2, -1],
        to: [0.13, 0.51, -0.3],
        rotation: [0, 0.1, -0.08],
      },
      {
        object: createBread(),
        from: [0.6, 5, 0],
        to: [0.75, 0.59, -0.3],
        rotation: [0.08, -0.2, -0.2],
      },
    ]

    const groceries = definitions.map((definition, index) => {
      arrangement.add(definition.object)

      return {
        ...definition,
        from: new THREE.Vector3(...definition.from),
        to: new THREE.Vector3(...definition.to),
        start: 0.12 + index * 0.075,
        end: 0.31 + index * 0.075,
      }
    })

    let targetProgress = 0
    let currentProgress = 0
    let lastPhase = -1
    let visible = true
    let mobile = false
    let elapsed = 0
    let previousTime = null

    function updateProgress() {
      const bounds = section.getBoundingClientRect()

      const travel = Math.max(
        1,
        section.offsetHeight - host.clientHeight,
      )

      targetProgress = clamp(
        (stickyOffset - bounds.top) / travel,
        0,
        1,
      )
    }

    function resize() {
      const width = host.clientWidth
      const height = host.clientHeight

      if (!width || !height) return

      mobile = width < 700

      renderer.setSize(width, height)
      camera.aspect = width / height

      // Pull the camera back on narrower screens.
      camera.position.set(0, mobile ? 3 : 2.5, mobile ? 11.8 : 8.7)
      camera.lookAt(0, 0.2, 0)
      camera.updateProjectionMatrix()

      updateProgress()
    }

    function onMotionChange(event) {
      reduceMotion = event.matches
      setReducedMotion(event.matches)
    }

    function onContextLost(event) {
      event.preventDefault()
      renderer.setAnimationLoop(null)
      setUnavailable(true)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { rootMargin: '100px' },
    )

    intersectionObserver.observe(section)

    window.addEventListener('scroll', updateProgress, { passive: true })
    motionQuery.addEventListener('change', onMotionChange)

    renderer.domElement.addEventListener(
      'webglcontextlost',
      onContextLost,
    )

    resize()
    updateProgress()

    function animate(time) {
      const delta =
        previousTime === null
          ? 0
          : Math.min((time - previousTime) / 1000, 0.05)

      previousTime = time

      if (!visible || document.hidden) return

      if (!reduceMotion) elapsed += delta

      // Frame-rate-independent smoothing.
      currentProgress = reduceMotion
        ? 1
        : lerp(
            currentProgress,
            targetProgress,
            1 - Math.exp(-delta * 12),
          )

      const p = currentProgress
      const finish = smoothstep(0.79, 0.96, p)
      const turn = smoothstep(0.61, 0.8, p)

      arrangement.rotation.y = -0.16 + turn * 0.65
      arrangement.rotation.z = reduceMotion
        ? 0
        : Math.sin(elapsed * 0.65) * 0.012 * (1 - finish)

      // Desktop: move left for the final message.
      // Mobile: move downward, leaving room above.
      arrangement.position.x = mobile ? 0 : -1.9 * finish

      arrangement.position.y =
        (mobile ? -0.45 * finish : 0) +
        (reduceMotion
          ? 0
          : Math.sin(elapsed * 1.1) * 0.07 * (1 - finish))

      arrangement.scale.setScalar(
        lerp(mobile ? 0.92 : 1, mobile ? 0.76 : 0.87, finish),
      )

      groceries.forEach((item, index) => {
        const raw = clamp(
          (p - item.start) / (item.end - item.start),
          0,
          1,
        )

        const t = smoothstep(0, 1, raw)

        item.object.visible = raw > 0.001
        item.object.position.lerpVectors(item.from, item.to, t)

        // Curved arrival path.
        item.object.position.y += Math.sin(Math.PI * t) * 0.7

        // Small landing movement that returns exactly to zero.
        const settling = Math.sin(Math.PI * t) * (t > 0.7 ? 0.12 : 0)

        item.object.position.y += settling

        item.object.rotation.set(
          item.rotation[0] + (1 - t) * 0.8,
          item.rotation[1] + (1 - t) * (index % 2 ? 1.4 : -1.4),
          item.rotation[2] + (1 - t) * (index % 2 ? -0.8 : 0.8),
        )

        item.object.scale.setScalar(
          smoothstep(0, 0.16, raw),
        )
      })

      const nextPhase =
        p < 0.12 ? 0 : p < 0.63 ? 1 : p < 0.83 ? 2 : 3

      if (nextPhase !== lastPhase) {
        lastPhase = nextPhase
        setPhase(nextPhase)
      }

      renderer.render(scene, camera)
    }

    renderer.setAnimationLoop(animate)

    // Required because your app uses React StrictMode.
    return () => {
      renderer.setAnimationLoop(null)

      window.removeEventListener('scroll', updateProgress)
      motionQuery.removeEventListener('change', onMotionChange)

      renderer.domElement.removeEventListener(
        'webglcontextlost',
        onContextLost,
      )

      resizeObserver.disconnect()
      intersectionObserver.disconnect()

      const geometries = new Set()
      const materials = new Set()

      scene.traverse((object) => {
        if (!object.isMesh) return

        geometries.add(object.geometry)

        const objectMaterials = Array.isArray(object.material)
          ? object.material
          : [object.material]

        objectMaterials.forEach((item) => materials.add(item))
      })

      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((item) => item.dispose())

      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [stickyOffset])

  function scrollToProducts() {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const complete = unavailable || reducedMotion || phase === 3

  const titles = [
    'Good things start with an empty basket.',
    'A little of everything you love.',
    'All your favourites. Together.',
  ]

  return (
    <section
      ref={sectionRef}
      className={`grocery-scroll ${
        unavailable || reducedMotion ? 'grocery-scroll--static' : ''
      }`}
      style={{
        '--grocery-sticky-offset': `${stickyOffset}px`,
      }}
      aria-label="Groceries filling a shopping basket"
    >
      <div className="grocery-scroll__sticky">
        <div className="grocery-scroll__top">
          <span>THE FRESH EDIT</span>

          <button type="button" onClick={scrollToProducts}>
            Skip to groceries ↗
          </button>
        </div>

        <div
          className="grocery-scroll__background-word"
          aria-hidden="true"
        >
          FRESH
        </div>

        <div
          ref={canvasHostRef}
          className="grocery-scroll__canvas"
          role="img"
          aria-label="A green 3D basket fills with an apple, carrot, broccoli, milk bottle and bread as you scroll"
          hidden={unavailable}
        />

        {!complete && (
          <div className="grocery-scroll__intro" key={phase}>
            <p>FRESH PICKS. EVERY DAY.</p>
            <h2>{titles[phase]}</h2>
          </div>
        )}

        {complete && (
          <div
            className={`grocery-scroll__finish ${
              unavailable ? 'grocery-scroll__finish--center' : ''
            }`}
          >
            <span>FROM YOUR LIST TO YOUR DOOR</span>

            <h2>
              Freshness,
              <br />
              <em>delivered.</em>
            </h2>

            <p>
              Fruit, vegetables and everyday essentials.
              Fill your basket with something good.
            </p>

            <button type="button" onClick={scrollToProducts}>
              Shop groceries
              <span aria-hidden="true">↗</span>
            </button>

            {unavailable && (
              <small>
                3D preview is unavailable on this device.
                You can still shop below.
              </small>
            )}
          </div>
        )}

        <div className="grocery-scroll__bottom">
          <span>
            {complete
              ? 'Your everyday goodness is waiting.'
              : '↓ Scroll to fill your basket'}
          </span>

          <div
            className="grocery-scroll__steps"
            aria-label={`Animation stage ${complete ? 4 : phase + 1} of 4`}
          >
            {[0, 1, 2, 3].map((item) => (
              <span
                key={item}
                className={
                  item === (complete ? 3 : phase) ? 'is-active' : ''
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}