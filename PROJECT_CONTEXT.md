# PROJECT_CONTEXT — Request

## What it is
"The Platform to Request Anything" — connects travelers with people who want items brought from specific cities/countries. Think a peer-to-peer errand/courier marketplace. Traveler posts a trip itinerary; requesters attach items to bring back.

## Status
Early build — scaffolding and branding complete, core flows in progress. Supabase: https://fstcshmibjjjyquqgkxn.supabase.co

## Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Database + Auth | Supabase |
| Hosting | Netlify |
| Source | GitHub (TheJimmyJam) |

## Repo layout
```
Request/
├── src/
│   ├── App.jsx
│   ├── pages/        ← Landing, Auth, AuthCallback, Dashboard, BrowseTrips, CreateTrip, TripDetail, RequestDetail, Profile
│   ├── components/   ← Navbar, TripCard, FeeCalculator
│   ├── contexts/
│   ├── hooks/
│   └── lib/
├── supabase/migrations/  ← 001_initial.sql
├── netlify/
├── public/
└── Logo-assets/      ← Full logo suite
```

## Credentials (see `/Projects/.credentials`)
- `REQUEST_SUPABASE_URL`, `REQUEST_SUPABASE_ANON_KEY`, `REQUEST_SUPABASE_SERVICE_ROLE_KEY`
- `REQUEST_SUPABASE_DB_PASSWORD`
- `REQUEST_NETLIFY_PAT`

## Pages / flows
- Landing — value prop
- Auth — sign up / login
- BrowseTrips — see all active traveler trips
- CreateTrip — post your travel itinerary
- TripDetail — view trip, attach requests
- RequestDetail — manage a specific request
- Dashboard — my trips + my requests
- Profile — user profile

## Key components
- `FeeCalculator` — fee estimation UI
- `TripCard` — trip listing card
- `Navbar`

## Notes
- Scaffolding brief: `Request_Scaffolding_Brief.docx`
- Branding: full logo suite in `Logo-assets/` and root SVGs (primary, wordmark, stacked, r-mark, etc.)
- `project-credentials.html` — local reference page for creds
- Only 1 Supabase migration so far — early schema stage
