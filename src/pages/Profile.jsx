import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import TripCard from '../components/TripCard'
import toast from 'react-hot-toast'
import { User, MapPin, Edit2, Save, X, Star, Globe, Loader2 } from 'lucide-react'

export default function Profile() {
  const { id }        = useParams()
  const { user, profile, updateProfile } = useAuth()
  const navigate      = useNavigate()

  const isOwnProfile  = !id || id === user?.id
  const targetId      = id || user?.id

  const [profileData, setProfileData] = useState(null)
  const [trips, setTrips]             = useState([])
  const [reviews, setReviews]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [editing, setEditing]         = useState(false)
  const [saving, setSaving]           = useState(false)

  const [editForm, setEditForm] = useState({ full_name: '', bio: '', location: '' })

  useEffect(() => {
    if (!targetId) { navigate('/auth'); return }
    fetchProfile()
    fetchTrips()
    fetchReviews()
  }, [targetId])

  useEffect(() => {
    if (profileData) {
      setEditForm({
        full_name: profileData.full_name || '',
        bio:       profileData.bio || '',
        location:  profileData.location || '',
      })
    }
  }, [profileData])

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single()
    setProfileData(data)
    setLoading(false)
  }

  async function fetchTrips() {
    const { data } = await supabase
      .from('trips_with_details')
      .select('*')
      .eq('traveler_id', targetId)
      .eq('status', 'active')
      .order('start_date', { ascending: true })
      .limit(6)
    setTrips(data || [])
  }

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select(`*, profiles!reviewer_id(full_name, avatar_url)`)
      .eq('reviewee_id', targetId)
      .order('created_at', { ascending: false })
      .limit(10)
    setReviews(data || [])
  }

  async function saveProfile() {
    if (!editForm.full_name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    const { error } = await updateProfile(editForm)
    setSaving(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Profile updated!')
      setEditing(false)
      fetchProfile()
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  )

  if (!profileData) return (
    <div className="text-center py-32">
      <p className="text-gray-500">Profile not found.</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar */}
        <div className="space-y-5">
          <div className="card p-6 text-center">
            {profileData.avatar_url ? (
              <img src={profileData.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-700 text-3xl font-bold">
                  {(profileData.full_name || '?')[0].toUpperCase()}
                </span>
              </div>
            )}

            {editing ? (
              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                    className="input text-sm"
                    placeholder="Dallas, TX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    className="input text-sm resize-none"
                    rows={3}
                    placeholder="Tell others about yourself…"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="btn-secondary flex-1 text-sm py-2">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button onClick={saveProfile} disabled={saving} className="btn-primary flex-1 text-sm py-2">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-gray-900">{profileData.full_name || 'Anonymous'}</h1>
                {profileData.location && (
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />{profileData.location}
                  </p>
                )}
                {avgRating && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                    <span className="font-semibold text-gray-800">{avgRating}</span>
                    <span className="text-xs text-gray-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                  </div>
                )}
                {profileData.bio && (
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profileData.bio}</p>
                )}
                {isOwnProfile && (
                  <button onClick={() => setEditing(true)} className="btn-secondary w-full mt-4 text-sm py-2">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
              </>
            )}
          </div>

          {/* Stats */}
          <div className="card p-5 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Stats</h3>
            {[
              ['Member Since', new Date(profileData.created_at).getFullYear()],
              ['Active Trips', trips.length],
              ['Reviews', reviews.length],
              ['Avg Rating', avgRating || 'No reviews yet'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-900">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active trips */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-600" />
              Active Trips
            </h2>
            {trips.length === 0 ? (
              <div className="card p-6 text-center text-gray-400">
                <p className="text-sm">No active trips right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-gold-500" />
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div className="card p-6 text-center text-gray-400">
                <p className="text-sm">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(review => (
                  <div key={review.id} className="card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {review.profiles?.avatar_url ? (
                        <img src={review.profiles.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.profiles?.full_name || 'Anonymous'}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
                          ))}
                          {Array.from({ length: 5 - review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-gray-200" />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
