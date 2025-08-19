
-- 1) Asegurar relación entre transcripciones y consultas
ALTER TABLE public.audio_recordings
ADD CONSTRAINT audio_recordings_consultation_id_fkey
FOREIGN KEY (consultation_id) REFERENCES public.consultations(id)
ON DELETE CASCADE;

-- 2) (Opcional pero recomendado) Storage para audios
-- Crear bucket "recordings" privado (si ya existe, no hacer nada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas: cada usuario gestiona solo su carpeta uid/... dentro del bucket
-- Leer
CREATE POLICY "Users can read own recordings files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'recordings' AND (name LIKE auth.uid()::text || '/%'));

-- Subir
CREATE POLICY "Users can upload own recordings files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recordings' AND (name LIKE auth.uid()::text || '/%'));

-- Actualizar
CREATE POLICY "Users can update own recordings files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'recordings' AND (name LIKE auth.uid()::text || '/%'))
WITH CHECK (bucket_id = 'recordings' AND (name LIKE auth.uid()::text || '/%'));

-- Eliminar
CREATE POLICY "Users can delete own recordings files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'recordings' AND (name LIKE auth.uid()::text || '/%'));
