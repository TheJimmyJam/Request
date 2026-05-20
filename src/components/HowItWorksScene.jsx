/**
 * HowItWorksScene
 * Animated explainer using the real Pierre & Sophie illustration.
 * HTML overlays + GSAP timeline — loops automatically.
 */
import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/animations'
import charactersImg from '../../Logo-assets/request transparent.png'

export default function HowItWorksScene() {
  const rootRef    = useRef(null)
  const imgRef     = useRef(null)
  const [processedSrc, setProcessedSrc] = useState(null)

  // Strip near-white / checkerboard pixels via canvas
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = imageData.data

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2]
        // Pixels that are near-white (the checker pattern)
        if (r > 195 && g > 195 && b > 195) {
          // Smooth fade: fully transparent at white, opaque at threshold
          const brightness = (r + g + b) / 3
          d[i+3] = Math.round(Math.max(0, (255 - brightness) * 2.2))
        }
      }

      ctx.putImageData(imageData, 0, 0)
      setProcessedSrc(canvas.toDataURL('image/png'))
    }
    img.src = charactersImg
  }, [])

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

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })

      // Beat 1 — Pierre's bubble appears and stays visible for reading (0s → 5s)
      tl.to('.sb-pierre', { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, 0.5)

      // Beat 2 — Platform card slides in while Pierre bubble still showing (2.5s)
      tl.to('.sc-platform', { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, 2.5)

      // Beat 3 — Pierre bubble fades, plane flies (5s)
      tl.to('.sb-pierre', { opacity: 0, duration: 0.4 }, 5.0)
      tl.to('.sc-plane',  { opacity: 1, duration: 0.2 }, 5.2)
      tl.to('.sc-plane',  { x: '420%', duration: 2.0, ease: 'power1.inOut' }, 5.2)
      tl.to('.sc-plane',  { opacity: 0, duration: 0.3 }, 7.0)

      // Beat 4 — Sophie's bubble appears (5.8s) and stays for reading
      tl.to('.sb-sophie', { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, 5.8)

      // Beat 5 — Match glow (9.5s), Sophie bubble fades
      tl.to('.sb-sophie', { opacity: 0, duration: 0.4 }, 9.5)
      tl.to('.sc-match',  { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, 9.6)
      tl.to('.sc-match',  { scale: 1.06, duration: 0.4, yoyo: true, repeat: 3, ease: 'power1.inOut' }, 10.1)

      // Beat 6 — Notifications pop and stay readable (11s)
      tl.to('.sc-notif-pierre', { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(2)' }, 11.0)
      tl.to('.sc-notif-sophie', { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(2)' }, 11.6)

      // Hold everything visible, then fade out for loop (16s)
      tl.to(['.sc-platform', '.sc-match', '.sc-notif-pierre', '.sc-notif-sophie'],
        { opacity: 0, duration: 0.6, stagger: 0.08 }, 16.0)
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
      className="relative w-full max-w-3xl mx-auto select-none pt-32 pb-36 sm:pt-0 sm:pb-0"
      style={{ minHeight: 320 }}
    >
      {/* ── Characters image ─────────────────────────────────────────── */}
      {processedSrc && (
        <img
          ref={imgRef}
          src={processedSrc}
          alt="Pierre and Sophie using Request"
          className="w-full h-auto relative z-10"
          draggable={false}
        />
      )}

      {/* ── Plane (top, flies left → right) ─────────────────────────── */}
      <div className="sc-plane absolute z-20 text-2xl top-[26%] left-[8%] sm:top-[4%]">
        ✈️
      </div>

      {/* ── Pierre's speech bubble (top-left on desktop, top-center on mobile) ── */}
      <div
        className="sb-pierre absolute z-20 bg-white rounded-2xl shadow-lg border border-indigo-100 px-3 py-2 text-left top-2 left-2 right-2 max-w-none mx-auto sm:top-[2%] sm:left-[4%] sm:right-auto sm:max-w-[188px] sm:mx-0"
      >
        <p className="text-[11px] font-bold text-gray-900 leading-snug">✈️ NYC trip — June 12–19</p>
        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Posting on Request…<br/>Who needs something from the US?</p>
        {/* Tail (desktop only) */}
        <div className="hidden sm:block absolute -bottom-2 left-6 w-3 h-3 bg-white border-r border-b border-indigo-100 rotate-45" />
      </div>

      {/* ── Platform card (center) ───────────────────────────────── */}
      <div
        className="sc-platform absolute z-20 rounded-2xl shadow-xl text-center px-4 py-3 top-20 sm:top-[5%] left-1/2 min-w-0 sm:min-w-[170px] max-w-[90%]"
        style={{
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        }}
      >
        <p className="text-white text-[11px] font-extrabold tracking-wide">🎯 MATCH FOUND</p>
        <div className="mt-1.5 bg-white/20 rounded-lg px-2 py-1">
          <p className="text-white text-[10px] font-semibold">Pierre → NYC · June 12</p>
          <p className="text-indigo-200 text-[9px]">Sophie's request: Levi's 501 · $89</p>
        </div>
      </div>

      {/* ── Sophie's speech bubble (top-right on desktop, top-center on mobile) ── */}
      <div
        className="sb-sophie absolute z-20 bg-white rounded-2xl shadow-lg border border-amber-100 px-3 py-2 text-right top-2 left-2 right-2 max-w-none mx-auto sm:top-[2%] sm:right-[4%] sm:left-auto sm:max-w-[188px] sm:mx-0"
      >
        <p className="text-[11px] font-bold text-gray-900 leading-snug">👖 Levi's 501 from NYC!</p>
        <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">Browsing Request for someone<br/>coming from the US… 🔍</p>
        {/* Tail (desktop only) */}
        <div className="hidden sm:block absolute -bottom-2 right-6 w-3 h-3 bg-white border-r border-b border-amber-100 rotate-45" />
      </div>

      {/* ── Match pulse ring (center) ────────────────────────────────── */}
      <div
        className="sc-match absolute z-10 rounded-full top-[45%] sm:top-[30%] left-1/2"
        style={{
          transform: 'translateX(-50%)',
          width: 100, height: 100,
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(124,58,237,0.06) 70%)',
        }}
      />

      {/* ── Pierre notification (bottom-left desktop, stacked top of bottom padding on mobile) ── */}
      <div
        className="sc-notif-pierre absolute z-20 rounded-xl shadow-lg px-3 py-2 bottom-20 left-2 right-2 sm:bottom-[8%] sm:left-[3%] sm:right-auto min-w-0 sm:min-w-[160px]"
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
        }}
      >
        <p className="text-white text-[10.5px] font-bold">🎉 Request accepted!</p>
        <p className="text-indigo-200 text-[9.5px] mt-0.5">Sophie wants Levi's 501s</p>
      </div>

      {/* ── Sophie notification (bottom-right desktop, stacked bottom on mobile) ── */}
      <div
        className="sc-notif-sophie absolute z-20 rounded-xl shadow-lg px-3 py-2 text-right bottom-2 left-2 right-2 sm:bottom-[8%] sm:right-[3%] sm:left-auto min-w-0 sm:min-w-[160px]"
        style={{
          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
        }}
      >
        <p className="text-white text-[10.5px] font-bold">✅ Pierre is bringing them!</p>
        <p className="text-amber-100 text-[9.5px] mt-0.5">Levi's 501s · arriving June 19</p>
      </div>

      {/* ── Location labels (desktop only — they overlap notif stack on mobile) ── */}
      <div className="hidden sm:block absolute bottom-1 left-[13%] z-20">
        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full">🇫🇷 Paris</span>
      </div>
      <div className="hidden sm:block absolute bottom-1 right-[13%] z-20">
        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🇫🇷 Paris</span>
      </div>
    </div>
  )
}
