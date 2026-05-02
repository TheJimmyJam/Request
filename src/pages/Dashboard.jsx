import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import TripCard from '../components/TripCard'
import { PlusCircle, Package, Globe, Loader2, InboxIcon } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_COLORS = {
  pending:   'status-pending',
  accepted:  'status-accepted',
  declined:  'status-declined',
  purchased: 'status-purchased',
  delivered: 'status-delivered',
  completed: 'status-completed',
  disputed:  'status-disputed',
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [tab, setTab]           = useState('my-trips')
  const [myTrips, setMyTrips]   = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchAll()
  }, [user])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchMyTrips(), fetchMyRequests()])
    setLoading(false)
  }

  async function fetchMyTrips() {
    const { data } = await supabase
      .from('trips_with_details')
      .select('*')
      .eq('traveler_id', user.id)
      .order('start_date', { ascending: true })
    setMyTrips(data || [])
  }

  async function fetchMyRequests() {
    const { data } = await supabase
      .from('requests')
      .select(`
        *,
        trips(destination, country, start_date, end_date, traveler_id,
          profiles!traveler_id(full_name, avatar_url)
        )
      `)
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false })
    setMyRequests(data || [])
  }

  const pendingCount  = myRequests.filter(r => r.status === 'pending').length
  const acceptedCount = myRequests.filter(r => r.status === 'accepted').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-gray-500 mt-1">Manage your trips and item requests.</p>
        </div>
        <Link to="/trips/new" className="btn-primary flex-shrink-0">
          <PlusCircle className="w-4 h-4" />
          Post a Trip
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Trips',     val: myTrips.filter(t => t.status === 'active').length,  icon: Globe,    color: 'text-brand-600 bg-brand-50' },
          { label: 'Pending Requests', val: pendingCount,                                         icon: Package,  color: 'text-amber-600 bg-amber-50' },
          { label: 'Active Requests',  val: acceptedCount,                                        icon: Package,  color: 'text-green-600 bg-green-50' },
          { label: 'Completed',        val: myRequests.filter(r => r.status === 'completed').length, icon: Package, color: 'text-purple-600 bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 w-fit mb-6">
        {[['my-trips', Globe, 'My Trips'], ['my-requests', Package, 'My Requests']].map(([val, Icon, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all ${
              tab === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : tab === 'my-trips' ? (
        <div>
          {myTrips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Globe className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No trips yet</h3>
              <p className="text-gray-400 mb-5">Post your first trip and start receiving requests.</p>
              <Link to="/trips/new" className="btn-primary">Post a Trip</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
            </div>
          )}
        </div>
      ) : (
        <div>
          {myRequests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No requests yet</h3>
              <p className="text-gray-400 mb-5">Browse active trips and make your first request.</p>
              <Link to="/trips" className="btn-primary">Browse Trips</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map(req => (
                <div key={req.id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={STATUS_COLORS[req.status] || 'badge bg-gray-50 text-gray-500'}>
                        {req.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(req.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{req.item_name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Trip to {req.trips?.destination} · {req.trips?.profiles?.full_name || 'Unknown traveler'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-gray-900">${parseFloat(req.total).toFixed(2)}</p>
                    </div>
                    <Link to={`/requests/${req.id}`} className="btn-secondary text-sm py-2 px-3">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
