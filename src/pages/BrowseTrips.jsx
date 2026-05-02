import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import TripCard from '../components/TripCard'
import { Search, MapPin, Calendar, SlidersHorizontal, PlusCircle, Loader2 } from 'lucide-react'

export default function BrowseTrips() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [trips, setTrips]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState(searchParams.get('destination') || '')
  const [dateFilter, setDateFilter] = useState('')
  const [sortBy, setSortBy]       = useState('start_date')

  useEffect(() => {
    fetchTrips()
  }, [search, dateFilter, sortBy])

  async function fetchTrips() {
    setLoading(true)
    let query = supabase
      .from('trips_with_details')
      .select('*')
      .eq('status', 'active')

    if (search.trim()) {
      query = query.or(
        `destination.ilike.%${search}%,country.ilike.%${search}%,city.ilike.%${search}%`
      )
    }
    if (dateFilter) {
      query = query.gte('start_date', dateFilter)
    }

    const orderMap = {
      start_date:     ['start_date', { ascending: true }],
      newest:         ['created_at', { ascending: false }],
      spots:          ['request_count', { ascending: true }],
    }
    const [col, opts] = orderMap[sortBy] || orderMap.start_date
    query = query.order(col, opts)

    const { data, error } = await query.limit(50)
    if (!error) setTrips(data || [])
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Trips</h1>
          <p className="text-gray-500 mt-1">Find a traveler heading where you need and make a request.</p>
        </div>
        {user && (
          <Link to="/trips/new" className="btn-primary flex-shrink-0">
            <PlusCircle className="w-4 h-4" />
            Post a Trip
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by destination, country, or city…"
              className="input pl-9"
            />
          </div>

          {/* Date filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="input pl-9 w-full sm:w-44"
              title="Trips starting from"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input pl-9 w-full sm:w-44 appearance-none cursor-pointer"
            >
              <option value="start_date">Soonest First</option>
              <option value="newest">Newest First</option>
              <option value="spots">Most Spots</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No trips found</h3>
          <p className="text-gray-400 mb-6">
            {search ? `No active trips to "${search}" right now.` : 'No active trips yet.'}
          </p>
          {user && (
            <Link to="/trips/new" className="btn-primary">
              Be the first to post a trip
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{trips.length} trip{trips.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
