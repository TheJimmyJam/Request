import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import BrowseTrips from './pages/BrowseTrips'
import TripDetail from './pages/TripDetail'
import CreateTrip from './pages/CreateTrip'
import RequestDetail from './pages/RequestDetail'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading Request…</p>
      </div>
    </div>
  )
}

export default function App() {
  const { loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"             element={<Landing />} />
          <Route path="/auth"         element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/trips"        element={<BrowseTrips />} />
          <Route path="/trips/:id"    element={<TripDetail />} />

          {/* Protected routes */}
          <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/trips/new"    element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
          <Route path="/requests/:id" element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} />
          <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:id"  element={<Profile />} />

          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-gray-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">R</span>
              </div>
              <span className="font-semibold text-gray-900">Request</span>
              <span className="text-gray-400 text-sm">— The Platform to Request Anything</span>
            </div>
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Request. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
