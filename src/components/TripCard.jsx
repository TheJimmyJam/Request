import { Link } from 'react-router-dom'
import { MapPin, Calendar, Users, Star } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function TripCard({ trip }) {
  const start = format(parseISO(trip.start_date), 'MMM d')
  const end   = format(parseISO(trip.end_date), 'MMM d, yyyy')
  const spotsLeft = trip.max_requests - (trip.request_count || 0)

  return (
    <Link to={`/trips/${trip.id}`} className="card p-5 flex flex-col gap-4 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-brand-600 font-semibold text-lg mb-0.5">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </div>
          {trip.city && (
            <p className="text-gray-400 text-xs ml-5.5">{trip.city}, {trip.country}</p>
          )}
        </div>
        <span className={`badge text-xs flex-shrink-0 ${
          trip.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
        }`}>
          {trip.status}
        </span>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <Calendar className="w-4 h-4 text-gray-400" />
        {start} — {end}
      </div>

      {/* Description */}
      {trip.description && (
        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{trip.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        {/* Traveler */}
        <div className="flex items-center gap-2">
          {trip.traveler_avatar ? (
            <img src={trip.traveler_avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-700 text-xs font-bold">
                {(trip.traveler_name || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-700">{trip.traveler_name || 'Anonymous'}</p>
            {trip.traveler_rating && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                <span className="text-xs text-gray-500">{trip.traveler_rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Spots */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users className="w-3.5 h-3.5" />
          <span className={spotsLeft <= 1 ? 'text-red-500 font-semibold' : ''}>
            {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Full'}
          </span>
        </div>
      </div>
    </Link>
  )
}
