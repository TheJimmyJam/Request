/**
 * HowItWorksScene
 * Animated explainer using the real Pierre & Sophie illustration.
 * HTML overlays + GSAP timeline — loops automatically.
 */
import { useEffect, useRef } from 'react'
import { gsap } from '../lib/animations'
import charactersImg from '../../Logo-assets/project request characters.png'

export default function HowItWorksScene() {
  const rootRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Initial states ──────────────────────────────────────────────
      gsap.set([
        '.sb-pierre', '.sb-sophie',
        '.sc-platform', '.sc-plane',
        '.sc-notif-pierre', '.sc-notif-sophie',
        '.sc-match',
      ], { opacity: 0 })

      gsap.set('.sb-pierre',       { y: 10 })
      gsap.set('.sb-sophie',       { y: 10 })
      gsap.set('.sc-platform',     { y: -10, scale: 0.9 })
      gsap.set('.sc-notif-pierre', { y: 8, scale: 0.9 })
      gsap.set('.sc-notif-sophie', { y: 8, scale: 0.9 })
      gsap.set('.sc-match',        { scale: 0.85 })
      gsap.set('.sc-plane',        { x: 0 })

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 })

      // Beat 1 — Pierre's bubble (posts his NYC trip)
      tl.to('.sb-pierre', { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(2)' }, 0.4)

      // Beat 2 — Platform card slides in
      tl.to('.sc-platform', { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.8)' }, 1.1)

      // Beat 3 — Pierre bubble fades, plane flies left→right
      tl.to('.sb-pierre', { opacity: 0, duration: 0.2 }, 1.8)
      tl.to('.sc-plane',  { opacity: 1, duration: 0.15 }, 2.0)
      tl.to('.sc-plane',  { x: '420%', duration: 1.5, ease: 'power1.inOut' }, 2.0)
      tl.to('.sc-plane',  { opacity: 0, duration: 0.2 }, 3.4)

      // Beat 4 — Sophie's bubble (wants Levi's from USA)
      tl.to('.sb-sophie', { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(2)' }, 2.3)

      // Beat 5 — Match glow, Sophie bubble fades
      tl.to('.sb-sophie', { opacity: 0, duration: 0.2 }, 3.6)
      tl.to('.sc-match',  { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }, 3.7)
      tl.to('.sc-match',  { scale: 1.06, duration: 0.35, yoyo: true, repeat: 3, ease: 'power1.inOut' }, 4.1)

      // Beat 6 — Notifications pop
      tl.to('.sc-notif-pierre', { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 4.6)
      tl.to('.sc-notif-sophie', { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 4.9)

      // Hold, then fade out for loop
      tl.to(['.sc-platform', '.sc-match', '.sc-notif-pierre', '.sc-notif-sophie'],
        { opacity: 0, duration: 0.5, stagger: 0.06 }, 7.5)
      tl.set(['.sb-pierre', '.sb-sophie'], { y: 10 })
      tl.set(['.sc-notif-pierre', '.sc-notif-sophie'], { y: 8, scale: 0.9 })
      tl.set('.sc-platform', { y: -10, scale: 0.9 })
      tl.set('.sc-match', { scale: 0.85 })
      tl.set('.sc-plane', { x: 0 })

    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      className="relative w-full max-w-3xl mx-auto select-none"
      style={{ minHeight: 320 }}
    >
      {/* ── Characters image ─────────────────────────────────────────── */}
      <img
        src={charactersImg}
        alt="Pierre and Sophie using Request"
        className="w-full h-auto relative z-10"
        style={{ mixBlendMode: 'multiply' }}
        draggable={false}
      />

      {/* ── Plane (top, flies left → right) ─────────────────────────── */}
      <div className="sc-plane absolute z-20 text-2xl" style={{ top: '4%', left: '8%' }}>
        ✈️
      </div>

      {/* ── Pierre's speech bubble (top-left) ───────────────────────── */}
      <div
        className="sb-pierre absolute z-20 bg-white rounded-2xl shadow-lg border border-indigo-100 px-3 py-2 text-left"
        style={{ top: '2%', left: '4%', maxWidth: 188 }}
      >
        <p className="text-[11px] font-bold text-gray-900 leading-snug">✈️ NYC trip — June 12–19</p>
        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Posting on Request…<br/>Who needs something from the US?</p>
        {/* Tail */}
        <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white border-r border-b border-indigo-100 rotate-45" />
      </div>

      {/* ── Platform card (center-top) ───────────────────────────────── */}
      <div
        className="sc-platform absolute z-20 rounded-2xl shadow-xl text-center px-4 py-3"
        style={{
          top: '5%', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          minWidth: 170,
        }}
      >
        <p className="text-white text-[11px] font-extrabold tracking-wide">🎯 MATCH FOUND</p>
        <div className="mt-1.5 bg-white/20 rounded-lg px-2 py-1">
          <p className="text-white text-[10px] font-semibold">Pierre → NYC · June 12</p>
          <p className="text-indigo-200 text-[9px]">Sophie's request: Levi's 501 · $89</p>
        </div>
      </div>

      {/* ── Sophie's speech bubble (top-right) ──────────────────────── */}
      <div
        className="sb-sophie absolute z-20 bg-white rounded-2xl shadow-lg border border-amber-100 px-3 py-2 text-right"
        style={{ top: '2%', right: '4%', maxWidth: 188 }}
      >
        <p className="text-[11px] font-bold text-gray-900 leading-snug">👖 Levi's 501 from NYC!</p>
        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Browsing Request for someone<br/>coming from the US… 🔍</p>
        {/* Tail */}
        <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white border-r border-b border-amber-100 rotate-45" />
      </div>

      {/* ── Match pulse ring (center) ────────────────────────────────── */}
      <div
        className="sc-match absolute z-10 rounded-full"
        style={{
          top: '30%', left: '50%', transform: 'translateX(-50%)',
          width: 100, height: 100,
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(124,58,237,0.06) 70%)',
        }}
      />

      {/* ── Pierre notification (bottom-left) ───────────────────────── */}
      <div
        className="sc-notif-pierre absolute z-20 rounded-xl shadow-lg px-3 py-2"
        style={{
          bottom: '8%', left: '3%',
          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
          minWidth: 160,
        }}
      >
        <p className="text-white text-[10.5px] font-bold">🎉 Request accepted!</p>
        <p className="text-indigo-200 text-[9.5px] mt-0.5">Sophie wants Levi's 501s</p>
      </div>

      {/* ── Sophie notification (bottom-right) ──────────────────────── */}
      <div
        className="sc-notif-sophie absolute z-20 rounded-xl shadow-lg px-3 py-2 text-right"
        style={{
          bottom: '8%', right: '3%',
          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
          minWidth: 160,
        }}
      >
        <p className="text-white text-[10.5px] font-bold">✅ Pierre is bringing them!</p>
        <p className="text-amber-100 text-[9.5px] mt-0.5">Levi's 501s · arriving June 19</p>
      </div>

      {/* ── Location labels ──────────────────────────────────────────── */}
      <div className="absolute bottom-1 left-[13%] z-20">
        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">🇫🇷 Paris</span>
      </div>
      <div className="absolute bottom-1 right-[13%] z-20">
        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🇫🇷 Paris</span>
      </div>
    </div>
  )
}
