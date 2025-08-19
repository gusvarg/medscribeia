-- Create audio_recordings table for optional 48-hour audio storage
CREATE TABLE IF NOT EXISTS public.audio_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  duration INTEGER,
  transcription TEXT,
  transcription_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on audio_recordings
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audio_recordings
CREATE POLICY "Users can manage own audio recordings" 
ON public.audio_recordings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create private storage bucket for audio files with 48h TTL
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('medscribe-audio', 'medscribe-audio', false, 52428800, ARRAY['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']);

-- Create storage policies for medscribe-audio bucket
CREATE POLICY "Users can upload their own audio files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'medscribe-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own audio files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'medscribe-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own audio files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'medscribe-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create trigger for updated_at on audio_recordings
CREATE TRIGGER update_audio_recordings_updated_at
  BEFORE UPDATE ON public.audio_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();