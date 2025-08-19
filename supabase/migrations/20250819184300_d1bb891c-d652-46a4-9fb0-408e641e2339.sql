
-- 1) Crear enum para tipo de documento (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_document_type') THEN
    CREATE TYPE public.patient_document_type AS ENUM ('CC','TI','DNI','PP','CE');
  END IF;
END;
$$;

-- 2) Añadir columnas a patients (idempotente)
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS document_type public.patient_document_type,
  ADD COLUMN IF NOT EXISTS eps text;

-- 3) Backfill suave de EPS desde medical_history si está en el formato "EPS: ... "
-- (Solo rellenamos donde eps está NULL y medical_history comienza con "EPS:")
UPDATE public.patients
SET eps = trim(BOTH FROM regexp_replace(medical_history, '^EPS:\\s*', '', 1, 1, 'i'))
WHERE eps IS NULL
  AND medical_history ILIKE 'EPS:%';

-- 4) Índice útil para filtros por consultorio (idempotente)
CREATE INDEX IF NOT EXISTS idx_patients_consultorio_id ON public.patients(consultorio_id);

-- Nota: No imponemos aún unicidad en (user_id, document_number) para evitar fallar
-- si hay duplicados existentes. Lo aplicamos en una segunda fase tras verificar datos.
