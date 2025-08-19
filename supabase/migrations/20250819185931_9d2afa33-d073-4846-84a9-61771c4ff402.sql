
DO $$
DECLARE
  v_user_id uuid;
  v_consultorio_id uuid;
  v_patient_id uuid;
  v_profile_id uuid;
  v_existing_consultation uuid;
BEGIN
  -- 1) Encontrar tu usuario por email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower('gvargasrub@gmail.com')
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No existe un usuario con el email %', 'gvargasrub@gmail.com';
  END IF;

  -- 2) Asegurar perfil: solo establecer specialty si está vacío
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    INSERT INTO public.profiles (user_id, first_name, last_name, specialty)
    VALUES (v_user_id, 'Medico', 'Ejemplo', 'Medicina General');
  ELSE
    UPDATE public.profiles
       SET specialty = COALESCE(NULLIF(specialty, ''), 'Medicina General')
     WHERE id = v_profile_id;
  END IF;

  -- 3) Crear o reutilizar el consultorio
  SELECT id INTO v_consultorio_id
  FROM public.consultorios
  WHERE user_id = v_user_id
    AND name = 'Centro Médico Calle 49'
  LIMIT 1;

  IF v_consultorio_id IS NULL THEN
    INSERT INTO public.consultorios (user_id, name, address)
    VALUES (v_user_id, 'Centro Médico Calle 49', 'Cra 49 #72-30, Medellín')
    RETURNING id INTO v_consultorio_id;
  END IF;

  -- 4) Crear o actualizar paciente de prueba (por documento + user)
  SELECT id INTO v_patient_id
  FROM public.patients
  WHERE user_id = v_user_id
    AND document_number = '8074579654'
  LIMIT 1;

  IF v_patient_id IS NULL THEN
    INSERT INTO public.patients (
      user_id, first_name, last_name, document_type, document_number, eps,
      phone, email, gender, address, date_of_birth, consultorio_id
    ) VALUES (
      v_user_id, 'Juan Carlos', 'Hernández', 'CC', '8074579654', 'EPS SURA',
      '+57 301 555 0199', 'juan.hernandez@example.com', 'Masculino', 'Cra 49 #72-30, Medellín',
      '1985-05-21', v_consultorio_id
    )
    RETURNING id INTO v_patient_id;
  ELSE
    UPDATE public.patients
       SET first_name = 'Juan Carlos',
           last_name = 'Hernández',
           document_type = 'CC',
           eps = 'EPS SURA',
           phone = '+57 301 555 0199',
           email = 'juan.hernandez@example.com',
           gender = 'Masculino',
           address = 'Cra 49 #72-30, Medellín',
           date_of_birth = '1985-05-21',
           consultorio_id = v_consultorio_id
     WHERE id = v_patient_id;
  END IF;

  -- 5) Crear consulta de prueba si no existe (marcada con nota 'Consulta de prueba (seed)')
  SELECT id INTO v_existing_consultation
  FROM public.consultations
  WHERE user_id = v_user_id
    AND patient_id = v_patient_id
    AND notes = 'Consulta de prueba (seed)'
  LIMIT 1;

  IF v_existing_consultation IS NULL THEN
    INSERT INTO public.consultations (
      user_id, patient_id, consultorio_id, consultation_date,
      chief_complaint, history_present_illness, physical_examination,
      assessment, plan, notes, ai_generated_content
    ) VALUES (
      v_user_id, v_patient_id, v_consultorio_id, now(),
      'Dolor de cabeza intenso de 3 días de evolución',
      'Paciente masculino de 39 años, sin antecedentes relevantes. Dolor opresivo frontal que empeora con el estrés. Sin náuseas ni vómito; sin fotofobia.',
      'TA 120/80 mmHg, FC 78 lpm, FR 16 rpm, Temp 36.8°C. Examen neurológico sin focalidad.',
      'Cefalea tensional',
      'Reposo, hidratación. Paracetamol 500 mg VO cada 8 horas por 48 horas. Indicar signos de alarma.',
      'Consulta de prueba (seed)',
      '{"summary":"Consulta de ejemplo para pruebas"}'::jsonb
    );
  END IF;
END $$;
