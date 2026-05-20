-- ============================================================
-- 003 — Counter Offers
-- ============================================================
-- Travelers can propose a counter to a pending request (different item_cost,
-- finder_fee, or both). The proposal stays inline on the request row; the
-- request status flips to 'countered' until the requester accepts or declines.
-- On accept, the requester moves counter values onto the live item_cost/
-- finder_fee fields (generated total/platform_fee follow automatically).

ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS counter_item_cost  NUMERIC(10,2)
    CHECK (counter_item_cost IS NULL OR counter_item_cost > 0),
  ADD COLUMN IF NOT EXISTS counter_finder_fee NUMERIC(10,2)
    CHECK (counter_finder_fee IS NULL OR counter_finder_fee >= 0),
  ADD COLUMN IF NOT EXISTS counter_message    TEXT,
  ADD COLUMN IF NOT EXISTS counter_by         UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS counter_at         TIMESTAMPTZ;

-- Extend the status enum check to include 'countered'
ALTER TABLE public.requests DROP CONSTRAINT IF EXISTS requests_status_check;
ALTER TABLE public.requests ADD CONSTRAINT requests_status_check
  CHECK (status IN ('pending','accepted','declined','countered','purchased','delivered','completed','disputed'));

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
