import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import TripCard from '../components/TripCard'
import { PlusCircle, Package, Globe, Loader2, InboxIcon, Trash2, X, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { gsap } from '../lib/animations'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending:   'status-pending',
  accepted:  'status-accepted',
  declined:  'status-declined',
  countered: 'badge bg-amber-100 text-amber-800',
  purchased: 'status-purchased',
  delivered: 'status-delivered',
  completed: 'status-completed',
  disputed:  'status-disputed',
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [tab, setTab]           = useState('my-trips')
  const [myTrips, setMyTrips]   = useState([])
  const [myRequests, setMyRequests]     = useState([])
  const [incomingRequests, setIncoming] = useState([])
  const [loading, setLoading]   = useState(true)
  const rootRef = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    fetchAll()
  }, [user])

  // Page entrance
  useEffect(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
      tl.from('.dash-header', { y: 30, opacity: 0, duration: 0.6 })
        .from('.dash-stat-card', { y: 24, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
        .from('.dash-tabs', { y: 16, opacity: 0, duration: 0.4 }, '-=0.2')
    }, rootRef)

    return () => ctx.revert()
  }, [])

  // Animate content area when it loads or tab changes
  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.from('.dash-content-item', {
        y: 20, opacity: 0, duration: 0.45, ease: 'power2.out', stagger: 0.08,
      })
    }, rootRef)
    return () => ctx.revert()
  }, [loading, tab])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchMyTrips(), fetchMyRequests(), fetchIncomingRequests()])
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
    // The `*` already includes the new counter_* columns
    setMyRequests(data || [])
  }

  // Requests submitted by OTHER users on trips I posted
  async function fetchIncomingRequests() {
    // First grab the IDs of trips I own
    const { data: myTripIds } = await supabase
      .from('trips')
      .select('id')
      .eq('traveler_id', user.id)
    const ids = (myTripIds || []).map(t => t.id)
    if (ids.length === 0) {
      setIncoming([])
      return
    }
    const { data } = await supabase
      .from('requests')
      .select(`
        *,
        trips(destination, country, start_date, end_date),
        profiles!requester_id(full_name, avatar_url)
      `)
      .in('trip_id', ids)
      .neq('requester_id', user.id)
      .order('created_at', { ascending: false })
    setIncoming(data || [])
  }

  async function updateIncomingStatus(reqId, status) {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', reqId)
    if (error) {
      toast.error(`Couldn't ${status} request: ${error.message}`)
    } else {
      toast.success(`Request ${status}`)
      fetchIncomingRequests()
    }
  }

  // ── Counter Offer (traveler proposes new price/fee) ─────────────────
  const [counterReq, setCounterReq]       = useState(null)   // request being countered (opens modal)
  const [counterCost, setCounterCost]     = useState('')
  const [counterFee, setCounterFee]       = useState('')
  const [counterMsg, setCounterMsg]       = useState('')
  const [counterSaving, setCounterSaving] = useState(false)

  function openCounterModal(req) {
    setCounterReq(req)
    setCounterCost(String(req.item_cost))
    setCounterFee(String(req.finder_fee))
    setCounterMsg('')
  }
  function closeCounterModal() {
    setCounterReq(null)
    setCounterCost('')
    setCounterFee('')
    setCounterMsg('')
  }

  async function submitCounter() {
    const cost = parseFloat(counterCost)
    const fee  = parseFloat(counterFee)
    if (isNaN(cost) || cost <= 0)  { toast.error('Item cost must be greater than 0'); return }
    if (isNaN(fee)  || fee  < 0)   { toast.error("Finder's fee can't be negative");   return }
    if (cost === parseFloat(counterReq.item_cost) && fee === parseFloat(counterReq.finder_fee)) {
      toast.error('Counter must be different from current offer')
      return
    }
    setCounterSaving(true)
    const { error } = await supabase
      .from('requests')
      .update({
        status: 'countered',
        counter_item_cost:  cost,
        counter_finder_fee: fee,
        counter_message:    counterMsg.trim() || null,
        counter_by:         user.id,
        counter_at:         new Date().toISOString(),
      })
      .eq('id', counterReq.id)
    setCounterSaving(false)
    if (error) {
      toast.error(`Couldn't send counter: ${error.message}`)
    } else {
      toast.success('Counter offer sent')
      closeCounterModal()
      fetchIncomingRequests()
    }
  }

  // ── Requester responds to a counter offer ───────────────────────────
  async function acceptCounter(req) {
    const { error } = await supabase
      .from('requests')
      .update({
        status:      'accepted',
        item_cost:   req.counter_item_cost,
        finder_fee:  req.counter_finder_fee,
        // clear the counter slot now that it's been adopted
        counter_item_cost:  null,
        counter_finder_fee: null,
        counter_message:    null,
        counter_by:         null,
        counter_at:         null,
      })
      .eq('id', req.id)
    if (error) toast.error(`Couldn't accept: ${error.message}`)
    else { toast.success('Counter accepted — request is now active'); fetchMyRequests() }
  }
  async function declineCounter(req) {
    const ok = window.confirm("Decline this counter offer? The request will be marked declined.")
    if (!ok) return
    const { error } = await supabase
      .from('requests')
      .update({ status: 'declined' })
      .eq('id', req.id)
    if (error) toast.error(`Couldn't decline: ${error.message}`)
    else { toast.success('Counter declined'); fetchMyRequests() }
  }

  const pendingCount  = myRequests.filter(r => r.status === 'pending').length
  const acceptedCount = myRequests.filter(r => r.status === 'accepted').length
  const incomingPendingCount = incomingRequests.filter(r => r.status === 'pending').length

  const [deletingId, setDeletingId] = useState(null)

  async function deleteRequest(req) {
    const ok = window.confirm(
      `Delete your request for "${req.item_name}"? This can't be undone.`
    )
    if (!ok) return

    setDeletingId(req.id)
    // Optimistic remove from list
    setMyRequests(prev => prev.filter(r => r.id !== req.id))

    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', req.id)
      .eq('requester_id', user.id)
      .eq('status', 'pending')

    setDeletingId(null)

    if (error) {
      toast.error(`Couldn't delete: ${error.message}`)
      // Re-fetch to restore the row if the optimistic remove was wrong
      fetchMyRequests()
    } else {
      toast.success('Request deleted')
    }
  }

  return (
    <div ref={rootRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="dash-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
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
          { label: 'Incoming Pending', val: incomingPendingCount,                                 icon: InboxIcon,color: 'text-rose-600 bg-rose-50' },
          { label: 'My Pending',       val: pendingCount,                                         icon: Package,  color: 'text-amber-600 bg-amber-50' },
          { label: 'My Active',        val: acceptedCount,                                        icon: Package,  color: 'text-green-600 bg-green-50' },
        ].map(stat => (
          <div key={stat.label} className="dash-stat-card card p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="dash-tabs flex rounded-lg bg-gray-100 p-1 w-fit mb-6 flex-wrap">
        {[
          ['my-trips',     Globe,      'My Trips',          null],
          ['incoming',     InboxIcon,  'Incoming Requests', incomingPendingCount],
          ['my-requests',  Package,    'My Requests',       null],
        ].map(([val, Icon, label, badge]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all ${
              tab === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
            {badge > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : tab === 'incoming' ? (
        <div>
          {incomingRequests.length === 0 ? (
            <div className="dash-content-item text-center py-16 bg-white rounded-xl border border-gray-100">
              <InboxIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No incoming requests</h3>
              <p className="text-gray-400">When travelers post requests on your trips, they'll show up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map(req => (
                <div key={req.id} className="dash-content-item card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                      From {req.profiles?.full_name || 'Anonymous'} · for your trip to {req.trips?.destination}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-gray-900">${parseFloat(req.total).toFixed(2)}</p>
                    </div>
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateIncomingStatus(req.id, 'accepted')}
                          className="btn-primary text-sm py-2 px-3"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => openCounterModal(req)}
                          className="text-sm py-2 px-3 rounded-lg text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors font-medium"
                        >
                          Counter
                        </button>
                        <button
                          onClick={() => updateIncomingStatus(req.id, 'declined')}
                          className="text-sm py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {req.status === 'countered' && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md font-medium">
                        Counter sent — waiting on requester
                      </span>
                    )}
                    <Link to={`/requests/${req.id}`} className="btn-secondary text-sm py-2 px-3">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === 'my-trips' ? (
        <div>
          {myTrips.length === 0 ? (
            <div className="dash-content-item text-center py-16 bg-white rounded-xl border border-gray-100">
              <Globe className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No trips yet</h3>
              <p className="text-gray-400 mb-5">Post your first trip and start receiving requests.</p>
              <Link to="/trips/new" className="btn-primary">Post a Trip</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myTrips.map(trip => <TripCard key={trip.id} trip={trip} className="dash-content-item" />)}
            </div>
          )}
        </div>
      ) : tab === 'my-requests' ? (
        <div>
          {myRequests.length === 0 ? (
            <div className="dash-content-item text-center py-16 bg-white rounded-xl border border-gray-100">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No requests yet</h3>
              <p className="text-gray-400 mb-5">Browse active trips and make your first request.</p>
              <Link to="/trips" className="btn-primary">Browse Trips</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map(req => {
                const isCountered = req.status === 'countered'
                const counterTotal = isCountered
                  ? (parseFloat(req.counter_item_cost) + parseFloat(req.counter_finder_fee)) * 1.10
                  : null
                return (
                <div key={req.id} className={`dash-content-item card p-5 flex flex-col gap-3 ${isCountered ? 'ring-2 ring-amber-200 bg-amber-50/40' : ''}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                      {req.status === 'pending' && (
                        <button
                          onClick={() => deleteRequest(req)}
                          disabled={deletingId === req.id}
                          className="text-sm py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors disabled:opacity-50"
                          title="Delete this pending request"
                          aria-label="Delete request"
                        >
                          {deletingId === req.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Counter offer received */}
                  {isCountered && (
                    <div className="border-t border-amber-200 pt-3 mt-1">
                      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">
                        Counter offer from {req.trips?.profiles?.full_name || 'traveler'}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Original Item</p>
                          <p className="text-sm font-medium text-gray-600 line-through">${parseFloat(req.item_cost).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Counter Item</p>
                          <p className="text-sm font-bold text-amber-900">${parseFloat(req.counter_item_cost).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Original Fee</p>
                          <p className="text-sm font-medium text-gray-600 line-through">${parseFloat(req.finder_fee).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Counter Fee</p>
                          <p className="text-sm font-bold text-amber-900">${parseFloat(req.counter_finder_fee).toFixed(2)}</p>
                        </div>
                      </div>
                      {req.counter_message && (
                        <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-amber-100 mb-3 italic">
                          "{req.counter_message}"
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-sm text-gray-600">
                          New total: <span className="font-bold text-gray-900">${counterTotal.toFixed(2)}</span>
                        </div>
                        <div className="ml-auto flex gap-2">
                          <button onClick={() => acceptCounter(req)} className="btn-primary text-sm py-2 px-3">
                            Accept Counter
                          </button>
                          <button onClick={() => declineCounter(req)} className="text-sm py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors">
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>
      ) : null}

      {/* Counter Offer Modal (traveler-side) */}
      {counterReq && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={closeCounterModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Counter Offer</h3>
                <p className="text-xs text-gray-500">for "{counterReq.item_name}"</p>
              </div>
              <button onClick={closeCounterModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Their item cost (X)</span>
                  <span className="font-medium text-gray-900">${parseFloat(counterReq.item_cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Their finder's fee (Y)</span>
                  <span className="font-medium text-gray-900">${parseFloat(counterReq.finder_fee).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Your item cost (X)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={counterCost}
                  onChange={(e) => setCounterCost(e.target.value)}
                  className="input"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Your finder's fee (Y)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={counterFee}
                  onChange={(e) => setCounterFee(e.target.value)}
                  className="input"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Message (optional)</label>
                <textarea
                  value={counterMsg}
                  onChange={(e) => setCounterMsg(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="Why are you countering? Add context for the requester…"
                />
              </div>

              <div className="bg-brand-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-700 font-medium">New total they pay</span>
                  <span className="font-bold text-brand-900">
                    ${(((parseFloat(counterCost) || 0) + (parseFloat(counterFee) || 0)) * 1.10).toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-brand-600 mt-1">(item + fee) × 1.10 — includes 10% Request fee</p>
              </div>
            </div>

            <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
              <button onClick={closeCounterModal} className="btn-secondary flex-1 text-sm py-2.5">
                Cancel
              </button>
              <button onClick={submitCounter} disabled={counterSaving} className="btn-primary flex-1 text-sm py-2.5">
                {counterSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Counter <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
