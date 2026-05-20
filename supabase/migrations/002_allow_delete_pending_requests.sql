-- ============================================================
-- 002 — Allow requesters to delete their own PENDING requests
-- ============================================================
-- A requester can DELETE their request row only while it is still in
-- the 'pending' state. Once a traveler has accepted/declined/etc., the
-- request is locked and cannot be removed by the requester.

DROP POLICY IF EXISTS "Requesters can delete pending requests" ON public.requests;

CREATE POLICY "Requesters can delete pending requests"
  ON public.requests
  FOR DELETE
  USING (auth.uid() = requester_id AND status = 'pending');
