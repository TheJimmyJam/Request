import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Send, Loader2, Package, MapPin, DollarSign,
  CheckCircle, XCircle, ExternalLink, Star
} from 'lucide-react'
import { format } from 'date-fns'

const STATUS_STEPS = ['pending', 'accepted', 'purchased', 'delivered', 'completed']

const STATUS_COLORS = {
  pending:   'status-pending',
  accepted:  'status-accepted',
  declined:  'status-declined',
  purchased: 'status-purchased',
  delivered: 'status-delivered',
  completed: 'status-completed',
  disputed:  'status-disputed',
}

export default function RequestDetail() {
  const { id }     = useParams()
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const bottomRef  = useRef(null)

  const [request, setRequest]   = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [msgText, setMsgText]   = useState('')
  const [sending, setSending]   = useState(false)

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [showReview, setShowReview] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)

  const isRequester = user && request && user.id === request.requester_id
  const isTraveler  = user && request && user.id === request.trips?.traveler_id

  useEffect(() => {
    fetchRequest()
    fetchMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `request_id=eq.${id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchRequest() {
    const { data } = await supabase
      .from('requests')
      .select(`
        *,
        trips(id, destination, country, start_date, end_date, traveler_id,
          profiles!traveler_id(full_name, avatar_url)
        ),
        profiles!requester_id(full_name, avatar_url)
      `)
      .eq('id', id)
      .single()
    setRequest(data)
    setLoading(false)
  }

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select(`*, profiles!sender_id(full_name, avatar_url)`)
      .eq('request_id', id)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!msgText.trim()) return
    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({ request_id: id, sender_id: user.id, content: msgText.trim() })
    setSending(false)
    if (error) toast.error('Failed to send message')
    else setMsgText('')
  }

  async function updateStatus(status) {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success(`Marked as ${status}`)
      fetchRequest()
    }
  }

  async function submitReview() {
    setSubmittingReview(true)
    const revieweeId = isRequester ? request.trips.traveler_id : request.requester_id
    const { error } = await supabase
      .from('reviews')
      .insert({
        request_id:  id,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating:      reviewForm.rating,
        comment:     reviewForm.comment.trim() || null,
      })
    setSubmittingReview(false)
    if (error) {
      if (error.code === '23505') toast.error("You've already left a review for this request.")
      else toast.error(error.message)
    } else {
      toast.success('Review submitted!')
      setShowReview(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  )

  if (!request) return (
    <div className="text-center py-32">
      <p className="text-gray-500">Request not found or you don't have access.</p>
      <Link to="/dashboard" className="btn-primary mt-4">Go to Dashboard</Link>
    </div>
  )

  const currentStep = STATUS_STEPS.indexOf(request.status)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Request info + messaging */}
        <div className="lg:col-span-3 space-y-5">

          {/* Request card */}
          <div className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-600" />
                  {request.item_name}
                </h1>
                <Link to={`/trips/${request.trips?.id}`} className="text-sm text-brand-600 hover:underline flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Trip to {request.trips?.destination}
                </Link>
              </div>
              <span className={STATUS_COLORS[request.status] || ''}>{request.status}</span>
            </div>

            {request.item_description && (
              <p className="text-sm text-gray-600 mb-3">{request.item_description}</p>
            )}
            {request.item_url && (
              <a href={request.item_url} target="_blank" rel="noreferrer"
                className="text-brand-600 text-xs flex items-center gap-1 mb-3 hover:underline">
                <ExternalLink className="w-3 h-3" /> Reference link
              </a>
            )}

            {/* Fee breakdown */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Item Cost</span>
                <span>${parseFloat(request.item_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Finder's Fee</span>
                <span>${parseFloat(request.finder_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-brand-700 font-medium">
                <span>Platform Fee (10%)</span>
                <span>${parseFloat(request.platform_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1 mt-1">
                <span>Total</span>
                <span>${parseFloat(request.total).toFixed(2)}</span>
              </div>
            </div>

            {request.notes && (
              <p className="text-xs text-gray-500 italic mt-3">Notes: "{request.notes}"</p>
            )}

            {/* Action buttons */}
            {request.status !== 'declined' && request.status !== 'completed' && (
              <div className="flex flex-wrap gap-2 mt-4">
                {isTraveler && request.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus('accepted')}
                      className="btn-primary text-sm py-2 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => updateStatus('declined')}
                      className="btn-secondary text-sm py-2 text-red-600 border-red-200 hover:bg-red-50">
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </>
                )}
                {isTraveler && request.status === 'accepted' && (
                  <button onClick={() => updateStatus('purchased')} className="btn-primary text-sm py-2">
                    Mark Purchased
                  </button>
                )}
                {isTraveler && request.status === 'purchased' && (
                  <button onClick={() => updateStatus('delivered')} className="btn-primary text-sm py-2">
                    Mark Delivered
                  </button>
                )}
                {isRequester && request.status === 'delivered' && (
                  <button onClick={() => updateStatus('completed')} className="btn-primary text-sm py-2">
                    Confirm Received
                  </button>
                )}
              </div>
            )}

            {/* Review button */}
            {request.status === 'completed' && (
              <button onClick={() => setShowReview(!showReview)} className="btn-secondary mt-3 text-sm py-2 w-full">
                <Star className="w-4 h-4" /> Leave a Review
              </button>
            )}

            {showReview && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                        <Star className={`w-7 h-7 transition-colors ${n <= reviewForm.rating ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    className="input resize-none"
                    rows={2}
                    placeholder="Share your experience…"
                  />
                </div>
                <button onClick={submitReview} disabled={submittingReview} className="btn-primary text-sm py-2 w-full">
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                </button>
              </div>
            )}
          </div>

          {/* Messaging */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900 text-sm">Messages</h2>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.sender_id === user?.id
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                      {msg.profiles?.avatar_url ? (
                        <img src={msg.profiles.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-brand-700 text-xs font-bold">
                            {(msg.profiles?.full_name || '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                        <div className={`px-3.5 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-brand-600 text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-xs text-gray-400 px-1">
                          {format(new Date(msg.created_at), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="px-4 py-3 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                placeholder="Type a message…"
                className="input flex-1 text-sm"
                disabled={!user}
              />
              <button type="submit" disabled={sending || !msgText.trim()} className="btn-primary px-3 py-2">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Status tracker + parties */}
        <div className="lg:col-span-2 space-y-5">

          {/* Status tracker */}
          {request.status !== 'declined' && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Status</h3>
              <div className="space-y-3">
                {STATUS_STEPS.map((step, i) => {
                  const done    = i <= currentStep
                  const current = i === currentStep
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border-2 ${
                        done
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <div className={`flex-1 ${current ? 'font-semibold text-gray-900' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                        <span className="text-sm capitalize">{step}</span>
                        {current && <span className="ml-2 text-xs text-brand-600 font-normal">(current)</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {request.status === 'declined' && (
            <div className="card p-5 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <p className="font-semibold">Request Declined</p>
              </div>
              <p className="text-xs text-red-500 mt-1">The traveler declined this request.</p>
            </div>
          )}

          {/* Parties */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Parties</h3>

            {/* Requester */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Buyer</p>
              <div className="flex items-center gap-2">
                {request.profiles?.avatar_url ? (
                  <img src={request.profiles.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-700 font-bold text-sm">
                      {(request.profiles?.full_name || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="font-medium text-gray-900 text-sm">{request.profiles?.full_name || 'Anonymous'}</p>
              </div>
            </div>

            {/* Traveler */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Traveler</p>
              <div className="flex items-center gap-2">
                {request.trips?.profiles?.avatar_url ? (
                  <img src={request.trips.profiles.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-brand-700 font-bold text-sm">
                      {(request.trips?.profiles?.full_name || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="font-medium text-gray-900 text-sm">{request.trips?.profiles?.full_name || 'Anonymous'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
