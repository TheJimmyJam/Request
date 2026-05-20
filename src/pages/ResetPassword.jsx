import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff } from 'lucide-react'
import stylizedR from '../../Logo-assets/stylized_R_clean.png'

/**
 * ResetPassword — landing page for the password-reset email link.
 *
 * Supabase appends an access token to the URL hash, which @supabase/supabase-js
 * automatically exchanges for a session on load. Once that session exists, the
 * user can call updateUser({ password }) to set a new password.
 */
export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [ready, setReady]         = useState(false)
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)

  // Wait for Supabase to pick up the recovery session from the URL hash
  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      // Either PASSWORD_RECOVERY or SIGNED_IN events get fired when the recovery link is followed
      if (session) setReady(true)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { error } = await updatePassword(password)
      if (error) throw error
      toast.success('Password updated! Redirecting…')
      setTimeout(() => navigate('/dashboard', { replace: true }), 800)
    } catch (err) {
      toast.error(err.message || 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={stylizedR}
            alt="Request"
            className="mx-auto h-16 w-auto object-contain mb-4"
            style={{ background: 'transparent' }}
            draggable={false}
          />
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">Set a new password</h1>
          <p className="text-gray-500 mt-1 text-sm uppercase tracking-wider">
            Choose a fresh password for your Request account.
          </p>
        </div>

        <div className="card p-6 shadow-md">
          {!ready ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
              <p className="text-sm text-gray-500">Verifying reset link…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pl-9 pr-10"
                    placeholder="Min 8 characters"
                    minLength={8}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="input pl-9"
                    placeholder="Re-type it"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
