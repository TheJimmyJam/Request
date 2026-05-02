import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { MapPin, Calendar, FileText, Users, ArrowLeft, Loader2 } from 'lucide-react'

export default function CreateTrip() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    destination: '',
    country: '',
    city: '',
    start_date: '',
    end_date: '',
    description: '',
    max_requests: 5,
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()

    if (new Date(form.end_date) <= new Date(form.start_date)) {
      toast.error('End date must be after start date')
      return
    }
    if (new Date(form.start_date) < new Date()) {
      toast.error('Start date must be in the future')
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .insert({
        traveler_id:  user.id,
        destination:  form.destination.trim(),
        country:      form.country.trim(),
        city:         form.city.trim() || null,
        start_date:   form.start_date,
        end_date:     form.end_date,
        description:  form.description.trim() || null,
        max_requests: Number(form.max_requests),
      })
      .select()
      .single()

    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Trip posted!')
      navigate(`/trips/${data.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a Trip</h1>
        <p className="text-gray-500 mt-1">Let others know where you're going and accept item requests.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Destination row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Destination <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.destination}
                onChange={e => set('destination', e.target.value)}
                className="input pl-9"
                placeholder="e.g. Scotland, The Highlands"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Country <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.country}
              onChange={e => set('country', e.target.value)}
              className="input"
              placeholder="e.g. Scotland"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">City <span className="text-gray-400">(optional)</span></label>
            <input
              type="text"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              className="input"
              placeholder="e.g. Edinburgh"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Departure Date <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={form.start_date}
                onChange={e => set('start_date', e.target.value)}
                className="input pl-9"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Return Date <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={form.end_date}
                onChange={e => set('end_date', e.target.value)}
                className="input pl-9"
                min={form.start_date || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Trip Description <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="input pl-9 resize-none"
              rows={3}
              placeholder="Tell buyers about your trip — where you'll be, what areas you'll cover, any restrictions on what you can bring…"
            />
          </div>
        </div>

        {/* Max requests */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Max Requests You'll Accept
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={form.max_requests}
              onChange={e => set('max_requests', e.target.value)}
              className="input pl-9 appearance-none cursor-pointer"
            >
              {[1,2,3,4,5,6,7,8,9,10,15,20].map(n => (
                <option key={n} value={n}>{n} request{n !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-1">Only accept what you can comfortably carry and manage.</p>
        </div>

        {/* Info box */}
        <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 text-sm text-brand-800">
          <p className="font-semibold mb-1">How this works</p>
          <p className="text-brand-700 text-xs leading-relaxed">
            Once posted, buyers can submit requests to your trip. You'll review each one and accept or decline.
            Request takes 10% of the total (item cost + finder's fee) as a connection fee.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Trip'}
          </button>
        </div>
      </form>
    </div>
  )
}
