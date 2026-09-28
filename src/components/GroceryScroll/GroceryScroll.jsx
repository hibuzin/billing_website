import { useEffect, useRef, useState } from 'react'
import basket from './assets/basket.png'
import apples from './assets/apples.png'
import carrots from './assets/carrots.png'
import broccoli from './assets/broccoli.png'
import milk from './assets/milk.png'
import bread from './assets/bread.png'
import './GroceryScroll.css'

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const mix = (a, b, t) => a + (b - a) * t
const smooth = (a, b, value) => {
  const t = clamp((value - a) / (b - a))
  return t * t * (3 - 2 * t)
}

// Positions are percentages of the composition, not screen pixels.
const ITEMS = [
  { name: 'Apples', src: apples, width: 19, from: [-43, -24], to: [-19, 7], rotate: -12, delay: 0.10, layer: 5 },
  { name: 'Carrots', src: carrots, width: 23, from: [43, -17], to: [17, 0], rotate: 15, delay: 0.18, layer: 4 },
  { name: 'Broccoli', src: broccoli, width: 25, from: [-38, -32], to: [-15, -1], rotate: -12, delay: 0.26, layer: 2 },
  { name: 'Milk bottle', src: milk, width: 18, from: [39, -34], to: [3, -3], rotate: 5, delay: 0.34, layer: 3 },
  { name: 'Sourdough loaf', src: bread, width: 25, from: [0, -47], to: [17, -2], rotate: 19, delay: 0.42, layer: 1 },
]

const HEADINGS = [
  ['A little room', 'for something good.'],
  ['Fresh picks.', 'Beautifully together.'],
  ['Your daily essentials,', 'thoughtfully gathered.'],
]

export default function GroceryScroll({ targetId = 'products', stickyOffset = 0,  tabs = null, }) {
  const sectionRef = useRef(null)
  const viewportRef = useRef(null)
  const stageRef = useRef(null)
  const itemRefs = useRef([])
  const progressRef = useRef(null)
  const pauseRef = useRef(false)
  const [phase, setPhase] = useState(0)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let active = true
    const images = [basket, ...ITEMS.map((item) => item.src)]
    Promise.all(images.map((src) => new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = resolve
      image.onerror = reject
      image.src = src
    }))).then(() => {
      if (active) setReady(true)
    }).catch(() => {
      if (active) setFailed(true)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    change()
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    if (!ready || failed) return undefined
    const section = sectionRef.current
    const viewport = viewportRef.current
    const stage = stageRef.current
    let target = 0
    let progress = reduced ? 1 : 0
    let lastPhase = -1
    let raf = 0
    let previousTime = null
    let elapsed = 0
    let visible = true
    let mobile = false
    let width = 1
    let height = 1

    const measure = () => {
      const bounds = section.getBoundingClientRect()
      const travel = Math.max(1, section.offsetHeight - viewport.clientHeight)
      target = clamp((stickyOffset - bounds.top) / travel)
      width = stage.clientWidth
      height = stage.clientHeight
      mobile = viewport.clientWidth < 720
    }

    const resize = new ResizeObserver(measure)
    resize.observe(viewport)
    resize.observe(stage)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    }, { rootMargin: '100px' })
    intersection.observe(section)
    window.addEventListener('scroll', measure, { passive: true })
    measure()

    const draw = (time) => {
      raf = requestAnimationFrame(draw)
      const dt = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time
      if (!visible || document.hidden || (pauseRef.current && !reduced)) return
      elapsed += reduced ? 0 : dt
      progress = reduced ? 1 : mix(progress, target, 1 - Math.exp(-dt * 11))
      const finish = smooth(0.79, 0.98, progress)
      const turn = smooth(0.64, 0.78, progress)
      const bob = reduced ? 0 : Math.sin(elapsed * 1.1) * 5 * (1 - finish)
      // A restrained perspective tilt; these remain photographic cutouts.
      stage.style.transform = `translate(-50%, -50%) translate3d(${mobile ? 0 : -finish * viewport.clientWidth * 0.22}px, ${bob + (mobile ? finish * viewport.clientHeight * 0.08 : 0)}px, 0) rotateY(${turn * -7}deg) rotateZ(${Math.sin(turn * Math.PI) * -2}deg) scale(${mix(1, mobile ? 0.83 : 0.86, finish)})`

      ITEMS.forEach((item, index) => {
        const element = itemRefs.current[index]
        if (!element) return
        const raw = clamp((progress - item.delay) / 0.22)
        const t = smooth(0, 1, raw)
        const x = mix(item.from[0], item.to[0], t) * width / 100
        const lift = Math.sin(t * Math.PI) * 6
        const settle = raw > 0.78 ? Math.sin((raw - 0.78) / 0.22 * Math.PI) * 0.6 : 0
        const y = (mix(item.from[1], item.to[1], t) - lift + settle) * height / 100
        element.style.opacity = String(smooth(0, 0.15, raw))
        element.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${mix(item.rotate * -2, item.rotate, t)}deg) scale(${mix(0.86, 1, t)})`
      })
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
      const next = progress < 0.10 ? 0 : progress < 0.64 ? 1 : progress < 0.85 ? 2 : 3
      if (next !== lastPhase) { lastPhase = next; setPhase(next) }
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', measure)
      resize.disconnect()
      intersection.disconnect()
    }
  }, [ready, failed, reduced, stickyOffset])

  const shop = () => {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth', block: 'start',
    })
  }
  const togglePause = () => {
    pauseRef.current = !pauseRef.current
    setPaused(pauseRef.current)
  }
  const complete = phase === 3 || reduced || failed
  const staticView = reduced || failed

  return (
    <section ref={sectionRef} className={`lg-scroll${staticView ? ' lg-scroll--static' : ''}`}
      style={{ '--lg-offset': `${stickyOffset}px` }} aria-label="Fresh groceries, thoughtfully gathered">
      <div ref={viewportRef} className="lg-viewport">
        {tabs && (
  <div className="lg-tabs">
    {tabs}
  </div>
)}
        <div className="lg-topline">
          <span className="lg-wordmark">THE FRESH EDIT<span> / </span>01</span>
          <button className="lg-skip" type="button" onClick={shop}>Explore groceries <span aria-hidden="true">↗</span></button>
        </div>
        <div className="lg-watermark" aria-hidden="true">TESCO SUPERMARKET</div>
        {!complete && <div className="lg-intro" key={phase}>
          <span className="lg-eyebrow">EVERYDAY GOODNESS, ELEVATED</span>
          <h2>{HEADINGS[Math.min(phase, 2)][0]}<br /><em>{HEADINGS[Math.min(phase, 2)][1]}</em></h2>
        </div>}
        {!ready && !failed && <p className="lg-loading" role="status">Preparing something fresh…</p>}
        {!failed && <div ref={stageRef} className={`lg-stage${ready ? ' is-ready' : ''}`} aria-hidden="true">
          <div className="lg-shadow" />
          <img className="lg-basket lg-basket--back" src={basket} alt="" draggable="false" />
          {ITEMS.map((item, index) => <img key={item.name} ref={(element) => { itemRefs.current[index] = element }}
            className="lg-food" src={item.src} alt="" draggable="false"
            style={{ width: `${item.width}%`, zIndex: item.layer + 2 }} />)}
          <img className="lg-basket lg-basket--front" src={basket} alt="" draggable="false" />
        </div>}
        {complete && <div className={`lg-finish${failed ? ' lg-finish--center' : ''}`}>
          <span className="lg-eyebrow">FROM YOUR LIST TO YOUR DOOR</span>
          <h2>Freshness,<br /><em>delivered.</em></h2>
          <p>Good food, beautifully gathered. Fill your basket with fresh favourites and everyday essentials.</p>
          <button className="lg-shop" onClick={shop} type="button">Shop groceries <span aria-hidden="true">↗</span></button>
          {failed && <small>The visual couldn’t load. You can still browse the groceries below.</small>}
        </div>}
        <div className="lg-footer">
          <span>{complete ? 'A little good food. A whole lot of good living.' : '↓ Scroll slowly. Let goodness come together.'}</span>
          {ready && !staticView && <button className="lg-motion" type="button" onClick={togglePause} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button>}
          <span className="lg-counter">0{complete ? 4 : phase + 1} <span>/ 04</span></span>
        </div>
        <div className="lg-progress" aria-hidden="true"><span ref={progressRef} /></div>
      </div>
    </section>
  )
}
