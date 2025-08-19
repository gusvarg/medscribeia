-- Add document_number column to patients table
ALTER TABLE public.patients 
ADD COLUMN document_number TEXT;