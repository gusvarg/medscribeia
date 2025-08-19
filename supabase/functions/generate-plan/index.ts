import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlanRequest {
  symptoms?: string;
  assessment?: string;
  diagnosisSummary?: string;
  patientAge?: number;
  patientGender?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  provider?: 'gemini' | 'openai';
}

const TREATMENT_PLAN_PROMPT = `Eres un médico experto que genera planes de tratamiento basados en evidencia.

Basándote en la información clínica proporcionada, genera un plan de tratamiento completo y estructurado que incluya:

1. **Tratamiento Farmacológico**:
   - Medicamentos específicos con dosis, vía de administración y duración
   - Considera contraindicaciones, alergias e interacciones medicamentosas
   - Alternativas terapéuticas si aplican

2. **Medidas No Farmacológicas**:
   - Modificaciones del estilo de vida
   - Fisioterapia, terapias complementarias
   - Medidas dietéticas y de autocuidado

3. **Seguimiento y Monitoreo**:
   - Cronograma de citas de seguimiento
   - Parámetros clínicos o laboratorios a monitorear
   - Criterios de mejoría y cuándo revaluar

4. **Educación al Paciente**:
   - Información clave sobre la condición
   - Signos de alarma que requieran consulta inmediata
   - Instrucciones específicas de cuidado

5. **Derivaciones**:
   - Especialistas que podrían requerirse
   - Cuándo y por qué derivar
   - Urgencia de la derivación

IMPORTANTE: Siempre considera las interacciones medicamentosas, especialmente si el paciente ya toma otros medicamentos. Responde SOLO con un objeto JSON válido con esta estructura:

{
  "pharmacologicalTreatment": [
    {
      "medication": "nombre del medicamento",
      "dosage": "dosis específica",
      "route": "vía de administración",
      "frequency": "frecuencia",
      "duration": "duración del tratamiento",
      "instructions": "instrucciones específicas"
    }
  ],
  "nonPharmacological": [
    {
      "category": "categoría (estilo de vida, fisioterapia, etc.)",
      "intervention": "intervención específica",
      "instructions": "instrucciones detalladas"
    }
  ],
  "followUp": {
    "nextAppointment": "cuándo programar próxima cita",
    "monitoringParameters": ["parámetros a monitorear"],
    "improvementCriteria": "qué esperar como mejoría"
  },
  "patientEducation": [
    {
      "topic": "tema educativo",
      "content": "información clave",
      "warningSigns": ["signos de alarma específicos"]
    }
  ],
  "referrals": [
    {
      "specialty": "especialidad médica",
      "reason": "motivo de derivación",
      "urgency": "urgente/rutinaria/electiva"
    }
  ],
  "drugInteractions": [
    {
      "interaction": "descripción de la interacción",
      "severity": "leve/moderada/severa",
      "recommendation": "recomendación específica"
    }
  ]
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const requestData: PlanRequest = await req.json();
    const { 
      symptoms, 
      assessment, 
      diagnosisSummary,
      patientAge, 
      patientGender, 
      medicalHistory, 
      currentMedications,
      allergies,
      provider = 'gemini' 
    } = requestData;

    if (!symptoms && !assessment && !diagnosisSummary) {
      throw new Error('Clinical information is required (symptoms, assessment, or diagnosis)');
    }

    // Build clinical context
    let clinicalContext = '';
    if (symptoms) clinicalContext += `Síntomas: ${symptoms}\n`;
    if (assessment) clinicalContext += `Evaluación: ${assessment}\n`;
    if (diagnosisSummary) clinicalContext += `Impresión diagnóstica: ${diagnosisSummary}\n`;
    if (patientAge) clinicalContext += `Edad del paciente: ${patientAge} años\n`;
    if (patientGender) clinicalContext += `Género: ${patientGender}\n`;
    if (medicalHistory) clinicalContext += `Antecedentes médicos: ${medicalHistory}\n`;
    if (currentMedications) clinicalContext += `Medicamentos actuales: ${currentMedications}\n`;
    if (allergies) clinicalContext += `Alergias: ${allergies}\n`;

    let planResult;

    if (provider === 'gemini') {
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${TREATMENT_PLAN_PROMPT}\n\nInformación clínica:\n${clinicalContext}`
            }]
          }]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No plan generated by Gemini');
      }

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON format in Gemini response');
      }

      planResult = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('OpenAI provider not yet implemented for treatment plans');
    }

    // Log the plan generation action
    await supabase.from('app_usage_logs').insert({
      user_id: user.id,
      action: 'treatment_plan_generated',
      details: {
        provider,
        clinical_info_provided: {
          symptoms: !!symptoms,
          assessment: !!assessment,
          diagnosis: !!diagnosisSummary,
          patient_age: !!patientAge,
          medical_history: !!medicalHistory,
          current_medications: !!currentMedications,
          allergies: !!allergies
        }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      plan: planResult,
      provider
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Generate plan error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to generate treatment plan'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});