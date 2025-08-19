-- Harden RLS on consultations to prevent unauthorized access to medical records
BEGIN;

-- Ensure RLS is enabled on consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Remove broad policy if it exists
DROP POLICY IF EXISTS "Users can manage own consultations" ON public.consultations;

-- Create granular, explicit policies scoped to authenticated users only
CREATE POLICY "Consultations: select own"
ON public.consultations
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Consultations: insert own"
ON public.consultations
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Consultations: update own"
ON public.consultations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Consultations: delete own"
ON public.consultations
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Also harden audio_recordings (related to consultations)
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own recordings" ON public.audio_recordings;

CREATE POLICY "Audio recordings: select own"
ON public.audio_recordings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Audio recordings: insert own"
ON public.audio_recordings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Audio recordings: update own"
ON public.audio_recordings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Audio recordings: delete own"
ON public.audio_recordings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations (user_id);
CREATE INDEX IF NOT EXISTS idx_audio_recordings_user_id ON public.audio_recordings (user_id);

COMMIT;