/**
 * HowItWorksScene
 * Animated GSAP explainer: two characters in France & USA using the Request platform.
 * Pierre (Paris) posts a trip to USA. Sophie (Paris) requests Levi's from someone coming from USA.
 */
import { useEffect, useRef } from 'react'
import { gsap } from '../lib/animations'

export default function HowItWorksScene() {
  const svgRef = useRef(null)
  const tlRef  = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    // Set everything invisible to start
    gsap.set([
      '#pierre-bubble', '#sophie-bubble',
      '#trip-card', '#request-card',
      '#notif-pierre', '#notif-sophie',
      '#plane', '#plane-trail',
      '#jeans-icon',
      '#match-glow',
      '#arrow-us-fr', '#arrow-fr-us',
      '#check-pierre', '#check-sophie',
    ], { opacity: 0 })

    gsap.set('#plane', { x: 0 })

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })

    // ── Beat 1: Pierre types at his computer (Paris → USA)
    tl.to('#pierre-laptop-screen', { fill: '#6366f1', duration: 0.3, yoyo: true, repeat: 1 }, 0.3)
      .to('#pierre-arms', { rotation: -5, transformOrigin: 'center', duration: 0.2, yoyo: true, repeat: 3 }, 0.3)

    // Pierre's speech bubble: "Going to NYC next week!"
    tl.to('#pierre-bubble', { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: 'bottom left' }, 0.8)
      .to('#pierre-bubble-text', { opacity: 1, duration: 0.25 }, 1.0)

    // Trip card appears on the "platform" (center)
    tl.to('#trip-card', { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.8)' }, 1.4)

    // Plane flies Paris → NYC (left to right)
    tl.to('#pierre-bubble', { opacity: 0, duration: 0.2 }, 1.8)
    tl.to('#plane', { opacity: 1, duration: 0.2 }, 2.0)
      .to('#plane-trail', { opacity: 0.6, duration: 0.2 }, 2.0)
      .to('#plane', { x: 280, duration: 1.6, ease: 'power1.inOut' }, 2.0)
      .to('#plane-trail', { scaleX: 3, transformOrigin: 'right center', opacity: 0, duration: 1.6, ease: 'power1.in' }, 2.0)
      .to('#plane', { opacity: 0, duration: 0.2 }, 3.5)

    // ── Beat 2: Sophie at her computer (looking for someone coming FROM USA)
    tl.to('#sophie-laptop-screen', { fill: '#f59e0b', duration: 0.3, yoyo: true, repeat: 1 }, 2.0)

    // Sophie's speech bubble: "Need Levi's 501s from the US!"
    tl.to('#sophie-bubble', { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: 'bottom right' }, 2.4)
      .to('#sophie-bubble-text', { opacity: 1, duration: 0.25 }, 2.6)

    // Request card appears on platform
    tl.to('#request-card', { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.8)' }, 2.9)
    tl.to('#jeans-icon', { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', transformOrigin: 'center' }, 3.1)

    // ── Beat 3: Match glow — the platform connects them!
    tl.to('#sophie-bubble', { opacity: 0, duration: 0.2 }, 3.6)
    tl.to('#match-glow', { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out', transformOrigin: 'center' }, 3.7)

    // Arrows appear connecting Pierre ↔ Sophie through the platform
    tl.to('#arrow-fr-us', { opacity: 1, strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 3.9)
    tl.to('#arrow-us-fr', { opacity: 1, strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 4.2)

    // ── Beat 4: Notifications pop on both screens
    tl.to('#notif-pierre', { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 4.8)
    tl.to('#notif-sophie', { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 5.1)

    // Checkmarks
    tl.to('#check-pierre', { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: 'center' }, 5.5)
    tl.to('#check-sophie', { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: 'center' }, 5.7)

    // Celebration pulse on match glow
    tl.to('#match-glow', { scale: 1.15, duration: 0.4, yoyo: true, repeat: 3, ease: 'power1.inOut', transformOrigin: 'center' }, 5.5)

    // Hold, then fade out everything for loop
    tl.to([
      '#trip-card', '#request-card', '#jeans-icon', '#match-glow',
      '#arrow-fr-us', '#arrow-us-fr', '#notif-pierre', '#notif-sophie',
      '#check-pierre', '#check-sophie',
    ], { opacity: 0, duration: 0.6, stagger: 0.05 }, 7.5)

    tlRef.current = tl

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto select-none" aria-hidden="true">
      <svg
        ref={svgRef}
        viewBox="0 0 900 420"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* ── Background ─────────────────────────────────────────────── */}
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#eef2ff" />
            <stop offset="100%" stopColor="#faf5ff" />
          </linearGradient>
          <linearGradient id="platformGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#00000020" />
          </filter>
          {/* Arrow marker */}
          <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#4f46e5" />
          </marker>
          <marker id="arrowHeadGold" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#d97706" />
          </marker>
        </defs>

        {/* Sky */}
        <rect width="900" height="420" fill="url(#bgGrad)" rx="16" />

        {/* Ground strip */}
        <rect x="0" y="340" width="900" height="80" fill="#e0e7ff" rx="0" opacity="0.5" />

        {/* ── Location labels ────────────────────────────────────────── */}
        {/* Paris flag + label */}
        <text x="90" y="44" textAnchor="middle" fontSize="22" fontFamily="system-ui">🇫🇷</text>
        <text x="90" y="68" textAnchor="middle" fontSize="13" fontWeight="700" fill="#4338ca" fontFamily="system-ui, sans-serif">Paris, France</text>

        {/* NYC flag + label */}
        <text x="810" y="44" textAnchor="middle" fontSize="22" fontFamily="system-ui">🇺🇸</text>
        <text x="810" y="68" textAnchor="middle" fontSize="13" fontWeight="700" fill="#b45309" fontFamily="system-ui, sans-serif">New York, USA</text>

        {/* ── Platform in the center ─────────────────────────────────── */}
        <rect id="platform-card" x="350" y="80" width="200" height="100" rx="14" fill="url(#platformGrad)" filter="url(#softShadow)" />
        <text x="450" y="122" textAnchor="middle" fontSize="13" fontWeight="800" fill="white" fontFamily="system-ui, sans-serif">REQUEST</text>
        <text x="450" y="140" textAnchor="middle" fontSize="10" fill="#c7d2fe" fontFamily="system-ui, sans-serif">The Platform</text>
        {/* Platform logo R */}
        <circle cx="450" cy="106" r="9" fill="white" opacity="0.2" />
        <text x="450" y="110" textAnchor="middle" fontSize="10" fontWeight="900" fill="white" fontFamily="system-ui, sans-serif">R</text>

        {/* ── Trip Card (center, animated in) ───────────────────────── */}
        <g id="trip-card" style={{ transform: 'translateY(12px) scale(0.9)' }}>
          <rect x="352" y="192" width="196" height="56" rx="10" fill="white" filter="url(#softShadow)" />
          <rect x="352" y="192" width="6" height="56" rx="3" fill="#4f46e5" />
          <text x="367" y="214" fontSize="9.5" fontWeight="700" fill="#1e1b4b" fontFamily="system-ui, sans-serif">✈️  Trip Posted</text>
          <text x="367" y="228" fontSize="8.5" fill="#6b7280" fontFamily="system-ui, sans-serif">Paris → New York City</text>
          <text x="367" y="241" fontSize="8" fill="#4f46e5" fontFamily="system-ui, sans-serif">June 12–19 · 5 spots open</text>
        </g>

        {/* ── Request Card (center, animated in) ────────────────────── */}
        <g id="request-card" style={{ transform: 'translateY(12px) scale(0.9)' }}>
          <rect x="352" y="256" width="196" height="56" rx="10" fill="white" filter="url(#softShadow)" />
          <rect x="352" y="256" width="6" height="56" rx="3" fill="#d97706" />
          <text x="367" y="278" fontSize="9.5" fontWeight="700" fill="#78350f" fontFamily="system-ui, sans-serif">🛍️  Request Submitted</text>
          <text x="367" y="292" fontSize="8.5" fill="#6b7280" fontFamily="system-ui, sans-serif">Levi's 501 Jeans · Size 32×32</text>
          <text x="367" y="305" fontSize="8" fill="#d97706" fontFamily="system-ui, sans-serif">$89 item + $20 finder's fee</text>
        </g>

        {/* Jeans icon */}
        <g id="jeans-icon" style={{ transformOrigin: 'center', transform: 'scale(0)' }}>
          <text x="562" y="282" fontSize="22" fontFamily="system-ui">👖</text>
        </g>

        {/* ── Match glow ─────────────────────────────────────────────── */}
        <g id="match-glow" style={{ transformOrigin: '450px 210px', transform: 'scale(0.8)' }}>
          <circle cx="450" cy="210" r="70" fill="#fbbf24" opacity="0.15" />
          <circle cx="450" cy="210" r="50" fill="#4f46e5" opacity="0.12" />
          <text x="450" y="330" textAnchor="middle" fontSize="12" fontWeight="700" fill="#4f46e5" fontFamily="system-ui, sans-serif">🎉 Match Found!</text>
        </g>

        {/* ── Connecting arrows (SVG path animations) ───────────────── */}
        {/* Pierre → Platform */}
        <path
          id="arrow-fr-us"
          d="M 185,190 Q 300,160 350,160"
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2"
          strokeDasharray="120"
          strokeDashoffset="120"
          markerEnd="url(#arrowHead)"
          opacity="0"
        />
        {/* Sophie → Platform */}
        <path
          id="arrow-us-fr"
          d="M 715,190 Q 600,160 550,160"
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          strokeDasharray="120"
          strokeDashoffset="120"
          markerEnd="url(#arrowHeadGold)"
          opacity="0"
        />

        {/* ── Plane (animated) ──────────────────────────────────────── */}
        <g id="plane" opacity="0">
          <text x="168" y="115" fontSize="20" fontFamily="system-ui">✈️</text>
        </g>
        <rect id="plane-trail" x="120" y="108" width="50" height="3" rx="2" fill="#a5b4fc" opacity="0" />

        {/* ────────────────────────────────────────────────────────────
            PIERRE — traveler in Paris posting his trip
        ──────────────────────────────────────────────────────────── */}
        {/* Desk */}
        <rect x="30" y="300" width="160" height="12" rx="4" fill="#c7d2fe" />
        <rect x="50" y="312" width="8" height="30" rx="2" fill="#a5b4fc" />
        <rect x="152" y="312" width="8" height="30" rx="2" fill="#a5b4fc" />

        {/* Laptop */}
        <rect x="55" y="248" width="110" height="54" rx="6" fill="#1e1b4b" />
        <rect id="pierre-laptop-screen" x="60" y="253" width="100" height="44" rx="4" fill="#312e81" />
        {/* Screen content */}
        <rect x="64" y="257" width="60" height="6" rx="2" fill="#818cf8" opacity="0.7" />
        <rect x="64" y="267" width="45" height="5" rx="2" fill="#6366f1" opacity="0.5" />
        <rect x="64" y="276" width="52" height="5" rx="2" fill="#6366f1" opacity="0.5" />
        <rect x="64" y="285" width="30" height="7" rx="3" fill="#4f46e5" />
        {/* Laptop base hinge */}
        <rect x="55" y="300" width="110" height="6" rx="3" fill="#312e81" />

        {/* Pierre character */}
        {/* Body */}
        <rect x="75" y="240" width="40" height="10" rx="5" fill="#4f46e5" opacity="0" />
        {/* Chair */}
        <rect x="68" y="325" width="50" height="6" rx="3" fill="#6366f1" opacity="0.4" />
        {/* Torso */}
        <rect x="80" y="278" width="30" height="24" rx="6" fill="#6366f1" />
        {/* Arms */}
        <g id="pierre-arms">
          <rect x="62" y="285" width="20" height="8" rx="4" fill="#6366f1" />
          <rect x="108" y="285" width="20" height="8" rx="4" fill="#6366f1" />
        </g>
        {/* Neck */}
        <rect x="91" y="272" width="8" height="8" rx="3" fill="#fbbf24" />
        {/* Head */}
        <circle cx="95" cy="262" r="14" fill="#fbbf24" />
        {/* Hair */}
        <path d="M 81,256 Q 83,246 95,244 Q 107,246 109,256" fill="#1e1b4b" />
        {/* Eyes */}
        <circle cx="90" cy="261" r="2.5" fill="#1e1b4b" />
        <circle cx="100" cy="261" r="2.5" fill="#1e1b4b" />
        <circle cx="90.8" cy="260.5" r="1" fill="white" />
        <circle cx="100.8" cy="260.5" r="1" fill="white" />
        {/* Smile */}
        <path d="M 90,267 Q 95,271 100,267" stroke="#1e1b4b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Beret */}
        <ellipse cx="95" cy="249" rx="14" ry="5" fill="#1e1b4b" />
        <circle cx="98" cy="246" r="3" fill="#1e1b4b" />

        {/* Pierre name */}
        <text x="95" y="370" textAnchor="middle" fontSize="11" fontWeight="600" fill="#4338ca" fontFamily="system-ui, sans-serif">Pierre</text>
        <text x="95" y="384" textAnchor="middle" fontSize="9" fill="#818cf8" fontFamily="system-ui, sans-serif">Traveler</text>

        {/* Pierre speech bubble */}
        <g id="pierre-bubble" style={{ transformOrigin: '180px 220px', transform: 'scale(0)' }}>
          <rect x="115" y="195" width="155" height="52" rx="10" fill="white" filter="url(#softShadow)" stroke="#e0e7ff" strokeWidth="1.5" />
          {/* Tail */}
          <polygon points="135,247 120,258 150,247" fill="white" stroke="#e0e7ff" strokeWidth="1" />
          <text id="pierre-bubble-text" x="193" y="217" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1e1b4b" fontFamily="system-ui, sans-serif" opacity="0">✈️ NYC trip June 12–19</text>
          <text x="193" y="231" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="system-ui, sans-serif">Posting my trip on Request…</text>
          <text x="193" y="244" textAnchor="middle" fontSize="8.5" fill="#4f46e5" fontFamily="system-ui, sans-serif">Who needs something from the US?</text>
        </g>

        {/* Pierre notification */}
        <g id="notif-pierre" style={{ transform: 'translateY(8px) scale(0.9)', transformOrigin: '95px 215px' }}>
          <rect x="50" y="215" width="90" height="28" rx="8" fill="#4f46e5" filter="url(#softShadow)" />
          <text x="95" y="226" textAnchor="middle" fontSize="8.5" fill="white" fontWeight="700" fontFamily="system-ui, sans-serif">🎉 Request matched!</text>
          <text x="95" y="237" textAnchor="middle" fontSize="8" fill="#c7d2fe" fontFamily="system-ui, sans-serif">Sophie wants Levi's 501s</text>
        </g>

        {/* Pierre check */}
        <g id="check-pierre" style={{ transform: 'scale(0)', transformOrigin: '140px 258px' }}>
          <circle cx="140" cy="258" r="10" fill="#10b981" />
          <path d="M 134,258 L 138,263 L 146,253" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* ────────────────────────────────────────────────────────────
            SOPHIE — shopper in Paris looking for Levi's from USA
        ──────────────────────────────────────────────────────────── */}
        {/* Desk */}
        <rect x="710" y="300" width="160" height="12" rx="4" fill="#fde68a" />
        <rect x="730" y="312" width="8" height="30" rx="2" fill="#fcd34d" />
        <rect x="832" y="312" width="8" height="30" rx="2" fill="#fcd34d" />

        {/* Laptop */}
        <rect x="735" y="248" width="110" height="54" rx="6" fill="#1c1917" />
        <rect id="sophie-laptop-screen" x="740" y="253" width="100" height="44" rx="4" fill="#292524" />
        {/* Screen content */}
        <rect x="744" y="257" width="60" height="6" rx="2" fill="#fbbf24" opacity="0.7" />
        <rect x="744" y="267" width="45" height="5" rx="2" fill="#d97706" opacity="0.5" />
        <rect x="744" y="276" width="52" height="5" rx="2" fill="#d97706" opacity="0.5" />
        <rect x="744" y="285" width="30" height="7" rx="3" fill="#d97706" />
        {/* Laptop base */}
        <rect x="735" y="300" width="110" height="6" rx="3" fill="#292524" />

        {/* Sophie character */}
        {/* Chair */}
        <rect x="748" y="325" width="50" height="6" rx="3" fill="#fcd34d" opacity="0.4" />
        {/* Torso */}
        <rect x="760" y="278" width="30" height="24" rx="6" fill="#f59e0b" />
        {/* Arms */}
        <rect x="742" y="285" width="20" height="8" rx="4" fill="#f59e0b" />
        <rect x="788" y="285" width="20" height="8" rx="4" fill="#f59e0b" />
        {/* Neck */}
        <rect x="771" y="272" width="8" height="8" rx="3" fill="#fbbf24" />
        {/* Head */}
        <circle cx="775" cy="262" r="14" fill="#fbbf24" />
        {/* Hair (long) */}
        <path d="M 761,256 Q 763,246 775,244 Q 787,246 789,256 L 791,275 Q 775,278 759,275 Z" fill="#92400e" />
        {/* Eyes */}
        <circle cx="770" cy="261" r="2.5" fill="#1e1b4b" />
        <circle cx="780" cy="261" r="2.5" fill="#1e1b4b" />
        <circle cx="770.8" cy="260.5" r="1" fill="white" />
        <circle cx="780.8" cy="260.5" r="1" fill="white" />
        {/* Smile */}
        <path d="M 770,267 Q 775,271 780,267" stroke="#1e1b4b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Glasses */}
        <circle cx="770" cy="261" r="5" fill="none" stroke="#92400e" strokeWidth="1.5" />
        <circle cx="780" cy="261" r="5" fill="none" stroke="#92400e" strokeWidth="1.5" />
        <line x1="775" y1="261" x2="776" y2="261" stroke="#92400e" strokeWidth="1.5" />
        <line x1="765" y1="261" x2="762" y2="262" stroke="#92400e" strokeWidth="1.5" />
        <line x1="785" y1="261" x2="788" y2="262" stroke="#92400e" strokeWidth="1.5" />

        {/* Sophie name */}
        <text x="775" y="370" textAnchor="middle" fontSize="11" fontWeight="600" fill="#b45309" fontFamily="system-ui, sans-serif">Sophie</text>
        <text x="775" y="384" textAnchor="middle" fontSize="9" fill="#d97706" fontFamily="system-ui, sans-serif">Shopper</text>

        {/* Sophie speech bubble */}
        <g id="sophie-bubble" style={{ transformOrigin: '700px 220px', transform: 'scale(0)' }}>
          <rect x="620" y="195" width="165" height="52" rx="10" fill="white" filter="url(#softShadow)" stroke="#fde68a" strokeWidth="1.5" />
          {/* Tail pointing right */}
          <polygon points="745,247 760,258 730,247" fill="white" stroke="#fde68a" strokeWidth="1" />
          <text id="sophie-bubble-text" x="703" y="217" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1e1b4b" fontFamily="system-ui, sans-serif" opacity="0">👖 Need Levi's 501 from NYC!</text>
          <text x="703" y="231" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="system-ui, sans-serif">Browsing Request for travelers</text>
          <text x="703" y="244" textAnchor="middle" fontSize="8.5" fill="#d97706" fontFamily="system-ui, sans-serif">coming from the US… 🔍</text>
        </g>

        {/* Sophie notification */}
        <g id="notif-sophie" style={{ transform: 'translateY(8px) scale(0.9)', transformOrigin: '775px 215px' }}>
          <rect x="730" y="215" width="90" height="28" rx="8" fill="#d97706" filter="url(#softShadow)" />
          <text x="775" y="226" textAnchor="middle" fontSize="8.5" fill="white" fontWeight="700" fontFamily="system-ui, sans-serif">✅ Pierre accepted!</text>
          <text x="775" y="237" textAnchor="middle" fontSize="8" fill="#fef3c7" fontFamily="system-ui, sans-serif">Your Levi's are coming 🎉</text>
        </g>

        {/* Sophie check */}
        <g id="check-sophie" style={{ transform: 'scale(0)', transformOrigin: '760px 258px' }}>
          <circle cx="760" cy="258" r="10" fill="#10b981" />
          <path d="M 754,258 L 758,263 L 766,253" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* ── Caption bar ────────────────────────────────────────────── */}
        <rect x="320" y="390" width="260" height="24" rx="12" fill="#4f46e5" opacity="0.08" />
        <text x="450" y="406" textAnchor="middle" fontSize="10" fill="#4338ca" fontWeight="600" fontFamily="system-ui, sans-serif">
          Real connections. Real items. Zero import hassle.
        </text>
      </svg>
    </div>
  )
}
