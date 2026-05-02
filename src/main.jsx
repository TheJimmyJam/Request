import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { supabaseMisconfigured } from './lib/supabase'
import './index.css'

// Show a clear setup screen if env vars are missing instead of a white crash
if (supabaseMisconfigured) {
  document.getElementById('root').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;font-family:system-ui,sans-serif;padding:24px">
      <div style="max-width:480px;background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #e2e8f0;text-align:center">
        <div style="width:56px;height:56px;background:#4338ca;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h1 style="font-size:22px;font-weight:700;color:#1e293b;margin:0 0 10px">Supabase not configured</h1>
        <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px">
          The app is missing its environment variables. Add these two keys in your
          <strong>Netlify → Site settings → Environment variables</strong> panel, then redeploy.
        </p>
        <div style="background:#f1f5f9;border-radius:10px;padding:20px;text-align:left;font-family:monospace;font-size:13px;color:#334155;line-height:2">
          <div><span style="color:#7c3aed;font-weight:600">VITE_SUPABASE_URL</span></div>
          <div style="color:#64748b;font-size:11px;margin-bottom:8px">https://fstcshmibjjjyquqgkxn.supabase.co</div>
          <div><span style="color:#7c3aed;font-weight:600">VITE_SUPABASE_ANON_KEY</span></div>
          <div style="color:#64748b;font-size:11px">eyJhbGci… (from Supabase → Project Settings → API)</div>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin:20px 0 0">After adding the vars, trigger a new deploy in Netlify.</p>
      </div>
    </div>
  `
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f8fafc',
                borderRadius: '10px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}
