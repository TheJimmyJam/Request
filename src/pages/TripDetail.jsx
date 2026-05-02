import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import FeeCalculator from '../components/FeeCalculator'
import toast from 'react-hot-toast'
import {
  MapPin, Calendar, Users, Star, ArrowLeft, Loader2,
  Package, DollarSign, FileText, ExternalLink, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'

const STATUS_COLORS = {
  pending:   'status-pending',
  accepted:  'status-accepted',
  declined:  'status-declined',
  purchased: 'status-purchased',
  delivered: 'status-delivered',
  completed: 'status-completed',
  disputed:  'status-disputed',
}

export default function TripDetail() {
  const { id }     = useParams()
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [trip, setTrip]         = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    item_name: '',
    item_description: '',
    item_url: '',
    item_cost: '',
    finder_fee: '',
    notes: '',
  })

  const isOwner     = user && trip && user.id === trip.traveler_id
  const hasRequested = requests.some(r => r.requester_id === user?.id)
  const spotsLeft   = trip ? trip.max_requests - requests.filter(r => r.status !== 'declined').length : 0

  useEffect(() => {
    fetchTrip()
    fetchRequests()
  }, [id])

  async function fetchTrip() {
    const { data } = await supabase
      .from('trips_with_details')
      .select('*')
      .eq('id', id)
      .single()
    setTrip(data)
    setLoading(false)
  }

  async function fetchRequests() {
    if (!user) return
    const { data } = await supabase
      .from('requests')
      .select(`
        *,
        profiles!requester_id(full_name, avatar_url)
      `)
      .eq('trip_id', id)
      .order('created_at', { ascending: false })
    setRequests(data || [])
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submitRequest(e) {
    e.preventDefault()
    if (!user) { navigate('/auth'); return }

    const x = parseFloat(form.item_cost)
    const y = parseFloat(form.finder_fee)
    if (!x || x <= 0) { toast.error('Enter a valid item cost'); return }
    if (isNaN(y) || y < 0) { toast.error('Enter a valid finder\'s fee (can be 0)'); return }

    setSubmitting(true)
    const { error } = await supabase
      .from('requests')
      .insert({
        trip_id:          id,
        requester_id:     user.id,
        item_name:        form.item_name.trim(),
        item_description: form.item_description.trim() || null,
        item_url:         form.item_url.trim() || null,
        item_cost:        x,
        finder_fee:       y,
        notes:            form.notes.trim() || null,
      })

    setSubmitting(false)
    if (error) {
      if (error.code === '23505') toast.error("You've already made a request on this trip.")
      else toast.error(error.message)
    } else {
      toast.success('Request submitted!')
      setShowForm(false)
      setForm({ item_name: '', item_description: '', item_url: '', item_cost: '', finder_fee: '', notes: '' })
      fetchRequests()
      // Trigger email notification
      fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'new_request', tripId: id, userId: user.id }),
      }).catch(() => {})
    }
  }

  async function updateRequestStatus(requestId, status) {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', requestId)
    if (error) toast.error(error.message)
    else {
      toast.success(`Request ${status}`)
      fetchRequests()
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  )

  if (!trip) return (
    <div className="text-center py-32">
      <p className="text-gray-500">Trip not found.</p>
      <Link to="/trips" className="btn-primary mt-4">Browse Trips</Link>
    </div>
  )

  const daysUntil = differenceInDays(parseISO(trip.start_date), new Date())

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Trips
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip header */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  {trip.destination}
                </h1>
                {trip.city && (
                  <p className="text-gray-400 text-sm mt-0.5 ml-7">{trip.city}, {trip.country}</p>
                )}
              </div>
              <span className={`badge ${trip.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {trip.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                {format(parseISO(trip.start_date), 'MMMM d')} — {format(parseISO(trip.end_date), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining` : 'No spots left'}
              </div>
              {daysUntil > 0 && (
                <div className="flex items-center gap-1.5 text-brand-600 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Departs in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {trip.description && (
              <p className="text-gray-600 leading-relaxed">{trip.description}</p>
            )}
          </div>

          {/* Request Form */}
          {!isOwner && trip.status === 'active' && spotsLeft > 0 && !hasRequested && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Make a Request</h2>
                {!showForm && (
                  <button onClick={() => { if (!user) navigate('/auth'); else setShowForm(true) }} className="btn-primary">
                    <Package className="w-4 h-4" />
                    {user ? 'Request an Item' : 'Sign In to Request'}
                  </button>
                )}
              </div>

              {showForm && (
                <form onSubmit={submitRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Item Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.item_name}
                      onChange={e => set('item_name', e.target.value)}
                      className="input"
                      placeholder="e.g. Glenfiddich 21 Year Reserve"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Item Description</label>
                    <textarea
                      value={form.item_description}
                      onChange={e => set('item_description', e.target.value)}
                      className="input resize-none"
                      rows={2}
                      placeholder="Be specific — size, color, exact model, where to find it…"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Reference Link <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={form.item_url}
                      onChange={e => set('item_url', e.target.value)}
                      className="input"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Item Cost (X) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={form.item_cost}
                          onChange={e => set('item_cost', e.target.value)}
                          className="input pl-8"
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Estimated purchase price</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Finder's Fee (Y) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={form.finder_fee}
                          onChange={e => set('finder_fee', e.target.value)}
                          className="input pl-8"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Your offer to the traveler</p>
                    </div>
                  </div>

                  <FeeCalculator itemCost={form.item_cost} finderFee={form.finder_fee} />

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Notes to Traveler <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={e => set('notes', e.target.value)}
                      className="input resize-none"
                      rows={2}
                      placeholder="Any special instructions, alternative options, etc."
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary flex-1">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}

              {!showForm && !user && (
                <p className="text-sm text-gray-500">
                  <Link to="/auth" className="text-brand-600 font-semibold">Sign in</Link> to submit a request on this trip.
                </p>
              )}
            </div>
          )}

          {hasRequested && !isOwner && (
            <div className="card p-4 border-green-200 bg-green-50">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <p className="font-semibold text-sm">You've submitted a request on this trip.</p>
              </div>
              <p className="text-xs text-green-600 mt-1 ml-7">
                The traveler will review it. Check your <Link to="/dashboard" className="underline">Dashboard</Link> for updates.
              </p>
            </div>
          )}

          {/* Requests list (traveler view) */}
          {isOwner && requests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Incoming Requests ({requests.length})</h2>
              {requests.map(req => (
                <div key={req.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {req.profiles?.avatar_url ? (
                        <img src={req.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-brand-700 text-xs font-bold">
                            {(req.profiles?.full_name || '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{req.profiles?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">{format(new Date(req.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <span className={STATUS_COLORS[req.status] || 'badge bg-gray-50 text-gray-500'}>{req.status}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{req.item_name}</h3>
                  {req.item_description && <p className="text-sm text-gray-600 mb-2">{req.item_description}</p>}
                  {req.item_url && (
                    <a href={req.item_url} target="_blank" rel="noreferrer" className="text-brand-600 text-xs flex items-center gap-1 mb-2 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Reference link
                    </a>
                  )}
                  {req.notes && <p className="text-xs text-gray-500 italic mb-3">"{req.notes}"</p>}

                  <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
                    <div className="flex justify-between text-gray-700">
                      <span>Item Cost</span><span>${parseFloat(req.item_cost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Finder's Fee</span><span>${parseFloat(req.finder_fee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-brand-700 font-semibold">
                      <span>Platform Fee (10%)</span><span>${parseFloat(req.platform_fee).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 mt-2 pt-2">
                      <span>Total</span><span>${parseFloat(req.total).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'accepted')}
                          className="btn-primary flex-1 text-sm py-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" /> Accept
                        </button>
                        <button
                          onClick={() => updateRequestStatus(req.id, 'declined')}
                          className="btn-secondary flex-1 text-sm py-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </>
                    )}
                    {req.status === 'accepted' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'purchased')}
                        className="btn-primary flex-1 text-sm py-2"
                      >
                        Mark Purchased
                      </button>
                    )}
                    {req.status === 'purchased' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'delivered')}
                        className="btn-primary flex-1 text-sm py-2"
                      >
                        Mark Delivered
                      </button>
                    )}
                    <Link
                      to={`/requests/${req.id}`}
                      className="btn-secondary text-sm py-2 px-3"
                    >
                      Message
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Traveler card */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Traveler</h3>
            <div className="flex items-center gap-3">
              {trip.traveler_avatar ? (
                <img src={trip.traveler_avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                  <span className="text-brand-700 text-lg font-bold">
                    {(trip.traveler_name || '?')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{trip.traveler_name || 'Anonymous'}</p>
                {trip.traveler_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                    <span className="text-sm text-gray-600">{trip.traveler_rating} rating</span>
                  </div>
                )}
              </div>
            </div>
            <Link to={`/profile/${trip.traveler_id}`} className="btn-secondary w-full mt-4 text-sm py-2">
              View Profile
            </Link>
          </div>

          {/* Trip stats */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Trip Details</h3>
            {[
              ['Destination', trip.destination],
              ['Departs', format(parseISO(trip.start_date), 'MMMM d, yyyy')],
              ['Returns', format(parseISO(trip.end_date), 'MMMM d, yyyy')],
              ['Duration', `${differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date))} days`],
              ['Spots Left', spotsLeft.toString()],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{val}</span>
              </div>
            ))}
          </div>

          {/* Fee info */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Platform Fee</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Request charges <strong>10%</strong> of the total (item cost + finder's fee) as a connection fee.
              This is calculated automatically when you submit a request.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
