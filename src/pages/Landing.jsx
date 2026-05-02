import { Link } from 'react-router-dom'
import { Globe, ShoppingBag, DollarSign, Star, ArrowRight, MapPin, Calendar, Package, CheckCircle } from 'lucide-react'

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

const FEATURED_DESTINATIONS = [
  { city: 'Edinburgh', country: 'Scotland', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', trips: 4 },
  { city: 'Tokyo',     country: 'Japan',    emoji: '🇯🇵', trips: 7 },
  { city: 'Paris',     country: 'France',   emoji: '🇫🇷', trips: 6 },
  { city: 'Florence',  country: 'Italy',    emoji: '🇮🇹', trips: 3 },
  { city: 'Melbourne', country: 'Australia',emoji: '🇦🇺', trips: 2 },
  { city: 'Mexico City', country: 'Mexico', emoji: '🇲🇽', trips: 5 },
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
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-700 rounded-full opacity-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-500 rounded-full opacity-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live Trips Available Now
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
              The Platform to{' '}
              <span className="text-gold-400">Request Anything</span>{' '}
              from Anywhere
            </h1>
            <p className="text-xl text-brand-200 mb-10 max-w-2xl leading-relaxed">
              Connect with travelers heading to your dream destination and ask them to bring back
              anything — rare spirits, artisan goods, limited editions. Skip the import fees.
              Get the real thing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/trips" className="btn-primary bg-gold-500 hover:bg-gold-600 text-gray-900 text-base px-7 py-3.5 font-bold">
                Browse Trips
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/auth?tab=signup" className="btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20 text-base px-7 py-3.5">
                Post Your Trip
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-6">
              {[
                ['500+', 'Active Trips'],
                ['2,400+', 'Items Delivered'],
                ['98%', 'Satisfaction Rate'],
              ].map(([num, label]) => (
                <div key={label}>
                  <p className="text-3xl font-extrabold text-white">{num}</p>
                  <p className="text-brand-300 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How Request Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Four simple steps between you and that hard-to-find item from across the globe.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="flex flex-col items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-gray-200">{String(i+1).padStart(2,'0')}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Explainer */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
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
                  <span className={`text-sm ${row.color}`}>{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 bg-brand-50 rounded-lg px-4 mt-2">
                <p className="font-bold text-brand-900 text-sm">Total You Pay</p>
                <span className="font-bold text-brand-700">(X + Y) × 1.10</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Destinations</h2>
              <p className="text-gray-500 mt-1">Travelers heading everywhere. Find your request.</p>
            </div>
            <Link to="/trips" className="text-brand-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              See all trips <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_DESTINATIONS.map(dest => (
              <Link
                key={dest.city}
                to={`/trips?destination=${encodeURIComponent(dest.country)}`}
                className="card p-4 flex flex-col items-center gap-2 text-center hover:border-brand-200"
              >
                <span className="text-3xl">{dest.emoji}</span>
                <p className="font-semibold text-gray-900 text-sm">{dest.city}</p>
                <p className="text-gray-400 text-xs">{dest.trips} active trips</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What People Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card p-6">
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
      <section className="py-20 bg-brand-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold mb-4">Ready to Request Anything?</h2>
          <p className="text-brand-300 text-lg mb-8">
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
      </section>
    </div>
  )
}
