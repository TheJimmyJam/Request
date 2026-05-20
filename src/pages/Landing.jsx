import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Globe, ShoppingBag, DollarSign, Star, ArrowRight, MapPin, Package } from 'lucide-react'
import { gsap, ScrollTrigger } from '../lib/animations'
import DestinationsMarquee from '../components/DestinationsMarquee'
import heroLogo from '../../Logo-assets/stylized_R_clean.png'

const HOW_IT_WORKS = [
  {
    icon: Globe,
    title: 'Traveler posts their trip',
    desc: 'Someone heading to Scotland, Japan, Italy — anywhere — posts their itinerary on Request, including dates and destination.',
    color: 'bg-indigo-50 text-brand-600',
  },
  {
    icon: ShoppingBag,
    title: 'You make a request',
    desc: "Browse active trips and ask the traveler to bring you something. Offer a price for the item plus a finder's fee for their effort.",
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: DollarSign,
    title: 'Deal is accepted',
    desc: "The traveler accepts your request. Request takes a small 10% connection fee from the total. Everyone wins.",
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Package,
    title: 'Item delivered',
    desc: 'The traveler picks up your item and arranges delivery. Leave a review and build reputation for future trips.',
    color: 'bg-purple-50 text-purple-600',
  },
]


const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    location: 'Austin, TX',
    text: 'Got a rare bottle of Yamazaki 18 from a traveler heading to Tokyo. Saved me hundreds in import fees and it arrived in perfect condition.',
    rating: 5,
  },
  {
    name: 'James T.',
    location: 'New York, NY',
    text: "I travel for work constantly. Request turned my trips into a side income. I've fulfilled 12 requests and everyone's been thrilled.",
    rating: 5,
  },
  {
    name: 'Maria L.',
    location: 'Dallas, TX',
    text: 'Found authentic Iberico ham from someone going to Madrid. The finder\'s fee was worth every penny. Couldn\'t get it any other way.',
    rating: 5,
  },
]

export default function Landing() {
  const rootRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Hero entrance timeline ──────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero-badge',   { y: -24, opacity: 0, duration: 0.55 })
        .from('.hero-logo',    { y: 30,  opacity: 0, scale: 0.85, duration: 0.9, ease: 'back.out(1.4)' }, '-=0.2')
        .from('.hero-tagline', { y: 30,  opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.hero-sub',     { y: 40,  opacity: 0, duration: 0.7 }, '-=0.55')
        .from('.hero-cta-btn', { y: 28,  opacity: 0, duration: 0.55, stagger: 0.12 }, '-=0.45')
        .from('.hero-stat',    { y: 20,  opacity: 0, duration: 0.5,  stagger: 0.1  }, '-=0.35')

      // ── Hero stats count-up (0 → target) ────────────────────────────────
      const numEls = rootRef.current?.querySelectorAll('.hero-stat-number') || []
      numEls.forEach((el, i) => {
        const target = parseInt(el.dataset.target, 10)
        const fmt = el.dataset.format
        const counter = { val: 0 }
        gsap.to(counter, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          delay: 1.4 + i * 0.15, // fires shortly after the .hero-stat entrance finishes
          onUpdate: () => {
            const n = Math.floor(counter.val)
            el.textContent = fmt === 'comma' ? n.toLocaleString() : String(n)
          },
        })
      })

      // ── Periodic Y-axis spin on the hero logo ───────────────────────────
      gsap.set('.hero-logo', { transformPerspective: 800, transformStyle: 'preserve-3d' })
      gsap.to('.hero-logo', {
        rotationY: '+=360',
        duration: 2.2,
        ease: 'power2.inOut',
        repeat: -1,
        repeatDelay: 6,    // pause between spins
        delay: 3,          // first spin starts 3s after load
      })

      // ── Floating orbs subtle parallax ──────────────────────────────────
      gsap.to('.hero-orb-top', {
        y: -60, ease: 'none',
        scrollTrigger: { trigger: '.hero-section', scrub: 1.5 }
      })
      gsap.to('.hero-orb-bot', {
        y: 60, ease: 'none',
        scrollTrigger: { trigger: '.hero-section', scrub: 1.5 }
      })

      // ── How It Works ────────────────────────────────────────────────────
      gsap.from('.how-heading', {
        y: 30, opacity: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: '.how-section', start: 'top 82%', once: true },
      })

      // Slow staggered slide-in from the right for the 4 step KPI cards
      gsap.set('.how-step-card', { xPercent: 120, opacity: 0 })
      gsap.to('.how-step-card', {
        xPercent: 0,
        opacity: 1,
        duration: 1.43,   // 30% slower than 1.1s
        ease: 'power3.out',
        stagger: 0.585,   // 30% slower than 0.45s
        scrollTrigger: { trigger: '.how-step-card', start: 'top 85%', once: true },
      })

      // ── Fee Explainer ───────────────────────────────────────────────────
      gsap.from('.fee-card', {
        y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: '.fee-section', start: 'top 82%', once: true },
      })

      // Scramble the right-column values into place
      const scrambleChars = '!<>-_\\/[]{}—=+*^?#§$%&@01ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const scrambleEl = (el, finalText, duration = 1.1) => {
        const chars = finalText.split('')
        const totalTicks = Math.max(18, chars.length * 4)
        let tick = 0
        const settledIdx = new Array(chars.length).fill(false)
        const settleAt = chars.map((_, i) =>
          Math.floor((i / chars.length) * totalTicks * 0.85) + Math.floor(Math.random() * 4)
        )
        const interval = (duration * 1000) / totalTicks
        el.textContent = chars.map(() => scrambleChars[Math.floor(Math.random() * scrambleChars.length)]).join('')
        const id = setInterval(() => {
          tick++
          const out = chars.map((c, i) => {
            if (settledIdx[i] || c === ' ') {
              settledIdx[i] = true
              return c
            }
            if (tick >= settleAt[i]) {
              settledIdx[i] = true
              return c
            }
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
          })
          el.textContent = out.join('')
          if (tick >= totalTicks) {
            clearInterval(id)
            el.textContent = finalText
          }
        }, interval)
      }

      ScrollTrigger.create({
        trigger: '.fee-section',
        start: 'top 70%',
        once: true,
        onEnter: () => {
          const els = rootRef.current?.querySelectorAll('.fee-scramble') || []
          els.forEach((el, i) => {
            const target = el.getAttribute('data-target') || el.textContent
            // 75% slower: duration 1.0 + i*0.1 → 1.75 + i*0.175; stagger 220ms → 385ms
            setTimeout(() => scrambleEl(el, target, 1.75 + i * 0.175), i * 385)
          })
        },
      })

      // ── Destinations ────────────────────────────────────────────────────
      gsap.from('.dest-heading', {
        y: 30, opacity: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: '.dest-section', start: 'top 82%', once: true },
      })
      gsap.from('.dest-card', {
        y: 30, opacity: 0, scale: 0.94, duration: 0.5, ease: 'back.out(1.4)', stagger: 0.07,
        scrollTrigger: { trigger: '.dest-section', start: 'top 78%', once: true },
      })

      // ── Testimonials ────────────────────────────────────────────────────
      gsap.from('.testimonials-heading', {
        y: 30, opacity: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: '.testimonials-section', start: 'top 82%', once: true },
      })
      gsap.from('.testimonial-card', {
        y: 40, opacity: 0, duration: 0.65, ease: 'power2.out', stagger: 0.14,
        scrollTrigger: { trigger: '.testimonials-section', start: 'top 78%', once: true },
      })

      // ── CTA ─────────────────────────────────────────────────────────────
      gsap.from('.cta-content > *', {
        y: 28, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: '.cta-section', start: 'top 82%', once: true },
      })

    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="overflow-hidden">

      {/* Hero */}
      <section className="hero-section relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white overflow-hidden">
        <div className="hero-orb-top absolute top-0 right-0 w-[600px] h-[600px] bg-brand-700 rounded-full opacity-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="hero-orb-bot absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-500 rounded-full opacity-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col items-center text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live Trips Available Now
            </div>

            {/* Main logo */}
            <img
              src={heroLogo}
              alt="Project Request"
              className="hero-logo w-44 sm:w-52 md:w-60 h-auto object-contain mb-1 drop-shadow-2xl"
              style={{ background: 'transparent', willChange: 'transform' }}
              draggable={false}
            />

            {/* Tagline (was the H1) */}
            <h1 className="hero-tagline text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">
              The platform to{' '}
              <span className="text-gold-400">request anything</span>{' '}
              from anywhere.
            </h1>

            <p className="hero-sub text-sm sm:text-base text-brand-200 mb-4 max-w-2xl leading-relaxed">
              Connect with travelers heading to your dream destination and ask them to bring back
              anything — rare spirits, artisan goods, limited editions. Skip the import fees.
              Get the real thing.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/trips" className="hero-cta-btn btn-primary bg-gold-500 hover:bg-gold-600 text-gray-900 text-sm px-6 py-2.5 font-bold">
                Browse Trips
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/auth?tab=signup" className="hero-cta-btn btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm px-6 py-2.5">
                Post Your Trip
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 justify-center">
              {[
                { target: 500,  suffix: '+', label: 'Active Trips',      format: 'plain' },
                { target: 2400, suffix: '+', label: 'Items Delivered',   format: 'comma' },
                { target: 98,   suffix: '%', label: 'Satisfaction Rate', format: 'plain' },
              ].map((stat) => (
                <div key={stat.label} className="hero-stat text-center">
                  <p className="text-xl font-extrabold text-white leading-none tabular-nums">
                    <span
                      className="hero-stat-number"
                      data-target={stat.target}
                      data-format={stat.format}
                    >0</span>
                    <span>{stat.suffix}</span>
                  </p>
                  <p className="text-brand-300 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="how-heading text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How Request Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Four simple steps from posted trip to delivered item.
            </p>
          </div>

          {/* Step KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.title}
                className="how-step-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-gray-100 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Explainer */}
      <section className="fee-section py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fee-card max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Simple, Transparent Fees</h3>
            <div className="space-y-4">
              {[
                { label: 'Item Cost (X)', desc: "What the traveler pays for your item", value: 'You set it', color: 'text-gray-700' },
                { label: "Finder's Fee (Y)", desc: "What you pay the traveler for their effort", value: 'You negotiate', color: 'text-gray-700' },
                { label: 'Request Fee (10%)', desc: "(X + Y) × 10% — our connection charge", value: 'Auto-calculated', color: 'text-brand-600 font-semibold' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{row.label}</p>
                    <p className="text-gray-400 text-xs">{row.desc}</p>
                  </div>
                  <span
                    className={`fee-scramble text-sm tabular-nums ${row.color}`}
                    data-target={row.value}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 bg-brand-50 rounded-lg px-4 mt-2">
                <p className="font-bold text-brand-900 text-sm">Total You Pay</p>
                <span
                  className="fee-scramble font-bold text-brand-700 tabular-nums"
                  data-target="(X + Y) × 1.10"
                >
                  (X + Y) × 1.10
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="dest-section py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="dest-heading flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
              <p className="text-gray-500 mt-1">Travelers heading everywhere. Find your request.</p>
            </div>
            <Link to="/trips" className="text-brand-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              See all trips <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <DestinationsMarquee />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="testimonials-heading text-3xl font-bold text-gray-900 text-center mb-12">What People Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{t.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-20 bg-brand-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="cta-content flex flex-col items-center gap-6">
            <h2 className="text-4xl font-extrabold">Ready to Request Anything?</h2>
            <p className="text-brand-300 text-lg">
              Join thousands of travelers and shoppers connecting across the globe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?tab=signup" className="btn-primary bg-gold-500 hover:bg-gold-600 text-gray-900 font-bold text-base px-8 py-3.5">
                Create Free Account
              </Link>
              <Link to="/trips" className="btn-secondary bg-transparent border-white/20 text-white hover:bg-white/10 text-base px-8 py-3.5">
                Browse Active Trips
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
