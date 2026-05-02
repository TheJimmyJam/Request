-- ============================================================
-- REQUEST PLATFORM — Initial Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT        NOT NULL DEFAULT '',
  avatar_url  TEXT,
  bio         TEXT,
  location    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- TRIPS (posted by travelers)
-- ─────────────────────────────────────────────
CREATE TABLE public.trips (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  traveler_id    UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destination    TEXT        NOT NULL,
  country        TEXT        NOT NULL,
  city           TEXT,
  start_date     DATE        NOT NULL,
  end_date       DATE        NOT NULL,
  description    TEXT,
  max_requests   INTEGER     DEFAULT 5 CHECK (max_requests > 0 AND max_requests <= 20),
  status         TEXT        DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX trips_traveler_idx    ON public.trips(traveler_id);
CREATE INDEX trips_destination_idx ON public.trips(destination);
CREATE INDEX trips_dates_idx       ON public.trips(start_date, end_date);
CREATE INDEX trips_status_idx      ON public.trips(status);

-- ─────────────────────────────────────────────
-- REQUESTS (item requests from buyers)
-- ─────────────────────────────────────────────
CREATE TABLE public.requests (
  id               UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id          UUID           REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  requester_id     UUID           REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_name        TEXT           NOT NULL,
  item_description TEXT,
  item_url         TEXT,
  item_cost        NUMERIC(10,2)  NOT NULL CHECK (item_cost > 0),   -- X: cost of the item
  finder_fee       NUMERIC(10,2)  NOT NULL CHECK (finder_fee >= 0), -- Y: fee for the traveler
  platform_fee     NUMERIC(10,2)  GENERATED ALWAYS AS (ROUND((item_cost + finder_fee) * 0.10, 2)) STORED,
  total            NUMERIC(10,2)  GENERATED ALWAYS AS (ROUND((item_cost + finder_fee) * 1.10, 2)) STORED,
  status           TEXT           DEFAULT 'pending'
                   CHECK (status IN ('pending','accepted','declined','purchased','delivered','completed','disputed')),
  notes            TEXT,
  traveler_notes   TEXT,
  created_at       TIMESTAMPTZ    DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    DEFAULT NOW(),
  -- Prevent duplicate requests from same buyer on same trip
  UNIQUE (trip_id, requester_id)
);

CREATE INDEX requests_trip_idx      ON public.requests(trip_id);
CREATE INDEX requests_requester_idx ON public.requests(requester_id);
CREATE INDEX requests_status_idx    ON public.requests(status);

-- ─────────────────────────────────────────────
-- MESSAGES (threaded per request)
-- ─────────────────────────────────────────────
CREATE TABLE public.messages (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id  UUID        REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  sender_id   UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX messages_request_idx ON public.messages(request_id);
CREATE INDEX messages_sender_idx  ON public.messages(sender_id);

-- ─────────────────────────────────────────────
-- REVIEWS (after completion)
-- ─────────────────────────────────────────────
CREATE TABLE public.reviews (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id   UUID        REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  reviewer_id  UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id  UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating       INTEGER     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (request_id, reviewer_id)
);

-- ─────────────────────────────────────────────
-- UPDATED_AT triggers
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_requests_updated_at BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews  ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- TRIPS
CREATE POLICY "Active trips are viewable by everyone"
  ON public.trips FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create trips"
  ON public.trips FOR INSERT WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Travelers can update their own trips"
  ON public.trips FOR UPDATE USING (auth.uid() = traveler_id);

CREATE POLICY "Travelers can delete their own trips"
  ON public.trips FOR DELETE USING (auth.uid() = traveler_id);

-- REQUESTS
CREATE POLICY "Travelers and requesters can view requests"
  ON public.requests FOR SELECT USING (
    auth.uid() = requester_id OR
    auth.uid() = (SELECT traveler_id FROM public.trips WHERE id = trip_id)
  );

CREATE POLICY "Authenticated users can create requests"
  ON public.requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Travelers can update request status"
  ON public.requests FOR UPDATE USING (
    auth.uid() = requester_id OR
    auth.uid() = (SELECT traveler_id FROM public.trips WHERE id = trip_id)
  );

-- MESSAGES
CREATE POLICY "Parties to a request can view messages"
  ON public.messages FOR SELECT USING (
    auth.uid() IN (
      SELECT requester_id FROM public.requests WHERE id = request_id
      UNION
      SELECT t.traveler_id FROM public.requests r
        JOIN public.trips t ON t.id = r.trip_id
        WHERE r.id = request_id
    )
  );

CREATE POLICY "Parties to a request can send messages"
  ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT requester_id FROM public.requests WHERE id = request_id
      UNION
      SELECT t.traveler_id FROM public.requests r
        JOIN public.trips t ON t.id = r.trip_id
        WHERE r.id = request_id
    )
  );

-- REVIEWS
CREATE POLICY "Reviews are publicly viewable"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Parties can write one review per request"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ─────────────────────────────────────────────
-- HELPER VIEWS
-- ─────────────────────────────────────────────

-- Trips with traveler info and request counts
CREATE OR REPLACE VIEW public.trips_with_details AS
SELECT
  t.*,
  p.full_name    AS traveler_name,
  p.avatar_url   AS traveler_avatar,
  COUNT(r.id)    AS request_count,
  ROUND(AVG(rv.rating), 1) AS traveler_rating
FROM public.trips t
JOIN public.profiles p ON p.id = t.traveler_id
LEFT JOIN public.requests r ON r.trip_id = t.id AND r.status != 'declined'
LEFT JOIN public.reviews rv ON rv.reviewee_id = t.traveler_id
GROUP BY t.id, p.full_name, p.avatar_url;
