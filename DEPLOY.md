# Deploying Request Platform

**Stack:** Supabase (DB + Auth) · Netlify (hosting + functions) · Resend (email) · GitHub (repo)

---

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New project
2. Give it the name **request-platform**
3. Choose a strong DB password (save it)
4. Pick a region closest to your users

### Run the database migration
1. In the Supabase dashboard → **SQL Editor** → New query
2. Paste the entire contents of `supabase/migrations/001_initial.sql`
3. Click **Run** — all tables, RLS policies, and triggers are created

### Enable Google Auth
1. Supabase dashboard → **Authentication** → **Providers** → Google
2. Enable it — follow the instructions to create a Google OAuth app at [console.cloud.google.com](https://console.cloud.google.com)
3. Add your Netlify URL as an authorized redirect URI:  
   `https://your-app.netlify.app/auth/callback`
4. Also add `http://localhost:5173/auth/callback` for local dev

### Get your keys
Go to **Project Settings** → **API** and copy:
- `Project URL` → `VITE_SUPABASE_URL`
- `anon / public key` → `VITE_SUPABASE_ANON_KEY`

---

## Step 2 — Create a Resend Account

1. Go to [resend.com](https://resend.com) → sign up free
2. Add and verify your sending domain
3. Go to **API Keys** → Create Key → copy it as `RESEND_API_KEY`
4. Set `FROM_EMAIL` to your verified address (e.g. `noreply@yourdomain.com`)

---

## Step 3 — Push to GitHub

```bash
cd /path/to/request-platform
git init
git add .
git commit -m "Initial commit — Request Platform"
gh repo create request-platform --public --source=. --push
```

Or create a repo on GitHub manually and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/request-platform.git
git branch -M main
git push -u origin main
```

---

## Step 4 — Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Connect your GitHub account and select the `request-platform` repo
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Set environment variables
In Netlify → **Site settings** → **Environment variables**, add:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `RESEND_API_KEY` | `re_...` |
| `FROM_EMAIL` | `noreply@yourdomain.com` |
| `APP_URL` | `https://your-app.netlify.app` |

4. Click **Deploy site**

---

## Step 5 — Update Supabase Auth Redirect URLs

1. Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Netlify URL: `https://your-app.netlify.app`
3. Add to **Redirect URLs**: `https://your-app.netlify.app/auth/callback`

---

## Step 6 (Optional) — Custom Domain via Cloudflare

1. Buy/manage your domain at [cloudflare.com](https://cloudflare.com)
2. In Netlify → **Domain settings** → **Add custom domain**
3. Point your Cloudflare DNS to Netlify:
   - Add a CNAME: `www` → `your-app.netlify.app`
   - Or an A record for the apex domain using Netlify's load balancer IPs
4. Netlify auto-provisions SSL via Let's Encrypt

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/request-platform.git
cd request-platform

# Install dependencies
npm install

# Copy env file and fill in your keys
cp .env.example .env

# Start dev server
npm run dev
```

Open `http://localhost:5173` — hot reload is enabled.

---

## Architecture Overview

```
Browser (React SPA)
    │
    ├── Supabase JS Client ──→ Supabase (Postgres + Auth + Realtime)
    │       ├── auth.users
    │       ├── profiles
    │       ├── trips
    │       ├── requests   (platform_fee & total generated columns)
    │       ├── messages   (realtime subscriptions)
    │       └── reviews
    │
    └── fetch() ──→ Netlify Functions
            └── send-email.js  ──→ Resend API
```

## Fee Formula (hardcoded in DB)
```
platform_fee = ROUND((item_cost + finder_fee) * 0.10, 2)
total        = ROUND((item_cost + finder_fee) * 1.10, 2)
```
These are Postgres **generated columns** — Sam's 10% is enforced at the database level, not just the UI.
