-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update accidents" ON public.accidents;

-- Create a function to check if the current user owns a station
CREATE OR REPLACE FUNCTION public.get_user_station_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.stations WHERE user_id = auth.uid() LIMIT 1
$$;

-- Policy: Allow acknowledging pending accidents (any authenticated user with a station)
-- This allows setting acknowledged_by, acknowledged_at, and status to 'acknowledged'
CREATE POLICY "Stations can acknowledge pending accidents"
ON public.accidents
FOR UPDATE
TO authenticated
USING (
  status = 'pending'
  AND EXISTS (SELECT 1 FROM public.stations WHERE user_id = auth.uid())
)
WITH CHECK (
  status = 'acknowledged'
  AND acknowledged_by = public.get_user_station_id()
);

-- Policy: Allow resolving accidents only by the station that acknowledged them
CREATE POLICY "Stations can resolve their acknowledged accidents"
ON public.accidents
FOR UPDATE
TO authenticated
USING (
  status = 'acknowledged'
  AND acknowledged_by = public.get_user_station_id()
)
WITH CHECK (
  status = 'resolved'
  AND acknowledged_by = public.get_user_station_id()
);