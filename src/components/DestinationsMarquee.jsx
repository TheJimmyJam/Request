import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '../lib/animations'

const ROW1 = [
  { city: 'Edinburgh',   country: 'Scotland',      emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', trips: 4 },
  { city: 'Tokyo',       country: 'Japan',          emoji: '🇯🇵', trips: 7 },
  { city: 'Paris',       country: 'France',         emoji: '🇫🇷', trips: 6 },
  { city: 'Florence',    country: 'Italy',          emoji: '🇮🇹', trips: 3 },
  { city: 'Melbourne',   country: 'Australia',      emoji: '🇦🇺', trips: 2 },
  { city: 'Mexico City', country: 'Mexico',         emoji: '🇲🇽', trips: 5 },
  { city: 'Dubai',       country: 'UAE',            emoji: '🇦🇪', trips: 4 },
  { city: 'Seoul',       country: 'South Korea',    emoji: '🇰🇷', trips: 6 },
  { city: 'Lisbon',      country: 'Portugal',       emoji: '🇵🇹', trips: 3 },
  { city: 'Amsterdam',   country: 'Netherlands',    emoji: '🇳🇱', trips: 5 },
]

const ROW2 = [
  { city: 'New York',    country: 'USA',            emoji: '🇺🇸', trips: 9 },
  { city: 'London',      country: 'UK',             emoji: '🇬🇧', trips: 8 },
  { city: 'Barcelona',   country: 'Spain',          emoji: '🇪🇸', trips: 5 },
  { city: 'Bangkok',     country: 'Thailand',       emoji: '🇹🇭', trips: 4 },
  { city: 'Buenos Aires',country: 'Argentina',      emoji: '🇦🇷', trips: 2 },
  { city: 'Cape Town',   country: 'South Africa',   emoji: '🇿🇦', trips: 3 },
  { city: 'Copenhagen',  country: 'Denmark',        emoji: '🇩🇰', trips: 2 },
  { city: 'Kyoto',       country: 'Japan',          emoji: '🇯🇵', trips: 5 },
  { city: 'Marrakech',   country: 'Morocco',        emoji: '🇲🇦', trips: 3 },
  { city: 'São Paulo',   country: 'Brazil',         emoji: '🇧🇷', trips: 4 },
]

function DestCard({ city, country, emoji, trips }) {
  return (
    <Link
      to={`/trips?destination=${encodeURIComponent(country)}`}
      className="inline-flex flex-col items-center gap-1.5 px-5 py-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-brand-200 hover:shadow-md transition-all mx-2 flex-shrink-0 w-32 text-center"
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <p className="font-semibold text-gray-900 text-sm leading-tight">{city}</p>
      <p className="text-gray-400 text-[11px]">{trips} trips</p>
    </Link>
  )
}

export default function DestinationsMarquee() {
  const track1Ref = useRef(null)
  const track2Ref = useRef(null)

  useEffect(() => {
    const el1 = track1Ref.current
    const el2 = track2Ref.current
    if (!el1 || !el2) return

    // Row 1 → moves left
    const anim1 = gsap.to(el1, {
      x: () => -el1.offsetWidth / 2,
      duration: 30,
      ease: 'none',
      repeat: -1,
    })

    // Row 2 → moves right (start at -50%, animate back to 0)
    gsap.set(el2, { x: () => -el2.offsetWidth / 2 })
    const anim2 = gsap.to(el2, {
      x: 0,
      duration: 28,
      ease: 'none',
      repeat: -1,
    })

    // Pause on hover
    const wrapper = el1.closest('.marquee-wrapper')
    const pause = () => { anim1.pause(); anim2.pause() }
    const play  = () => { anim1.play();  anim2.play()  }
    wrapper?.addEventListener('mouseenter', pause)
    wrapper?.addEventListener('mouseleave', play)

    return () => {
      anim1.kill()
      anim2.kill()
      wrapper?.removeEventListener('mouseenter', pause)
      wrapper?.removeEventListener('mouseleave', play)
    }
  }, [])

  return (
    <div className="marquee-wrapper overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-0">
      {/* Row 1 — left */}
      <div className="flex mb-3">
        <div ref={track1Ref} className="flex will-change-transform">
          {[...ROW1, ...ROW1].map((d, i) => (
            <DestCard key={`r1-${i}`} {...d} />
          ))}
        </div>
      </div>

      {/* Row 2 — right */}
      <div className="flex">
        <div ref={track2Ref} className="flex will-change-transform">
          {[...ROW2, ...ROW2].map((d, i) => (
            <DestCard key={`r2-${i}`} {...d} />
          ))}
        </div>
      </div>
    </div>
  )
}
