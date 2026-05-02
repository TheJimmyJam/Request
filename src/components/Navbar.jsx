import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, Globe, ChevronDown, LogOut, User, LayoutDashboard, PlusCircle } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Request</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/trips"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/trips') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Browse Trips
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/trips/new"
                  className="btn-primary text-sm py-2 px-4"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post a Trip
                </Link>
                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                        <span className="text-brand-700 text-xs font-bold">
                          {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50"
                      onBlur={() => setUserMenuOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-gray-50">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {profile?.full_name || 'My Account'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 text-gray-400" /> My Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-ghost">Sign In</Link>
                <Link to="/auth?tab=signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link to="/trips" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
            Browse Trips
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link to="/trips/new" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                Post a Trip
              </Link>
              <Link to="/profile" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                My Profile
              </Link>
              <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
              <Link to="/auth?tab=signup" className="block px-3 py-2 rounded-lg text-sm font-semibold text-brand-600 hover:bg-brand-50" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
