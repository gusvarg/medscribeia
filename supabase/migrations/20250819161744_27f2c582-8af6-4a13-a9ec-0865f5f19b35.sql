
-- Add foreign key constraint to link appointments with patients
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Add foreign key constraint to link appointments with user profiles (optional but good practice)
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
