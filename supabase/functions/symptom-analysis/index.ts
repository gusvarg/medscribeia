import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SymptomRequest {
  symptoms: string;
  patientAge?: number;
  patientGender?: string;
  medicalHistory?: string;
  currentMedications?: string;
  provider?: 'gemini' | 'openai';
}

const SYMPTOM_ANALYSIS_PROMPT = `Eres un asistente médico experto que ayuda con el análisis de síntomas. 

Basándote en los síntomas presentados y la información del paciente, proporciona un análisis estructurado que incluya:

1. **Diagnósticos Diferenciales** (ordenados por probabilidad):
   - Lista los posibles diagnósticos con una breve justificación
   - Considera la presentación clínica típica de cada condición
   - Incluye tanto condiciones comunes como importantes diagnósticos que no se deben pasar por alto

2. **Señales de Alarma (Red Flags)**:
   - Identifica síntomas o combinaciones que requieran atención inmediata
   - Menciona criterios de hospitalización o derivación urgente

3. **Exámenes Físicos Sugeridos**:
   - Examen físico dirigido basado en los síntomas
   - Maniobras específicas o pruebas en consultorio
   - Signos vitales críticos a evaluar

4. **Exámenes Complementarios Iniciales**:
   - Laboratorios básicos indicados
   - Estudios de imagen si están justificados
   - Otros exámenes diagnósticos específicos

Mantén un enfoque clínico práctico y basado en evidencia. Si la información es insuficiente, menciona qué datos adicionales serían útiles.

IMPORTANTE: Responde SOLO con un objeto JSON válido con esta estructura:
{
  "differentialDiagnoses": [
    {
      "diagnosis": "nombre del diagnóstico",
      "probability": "alta/media/baja",
      "justification": "breve explicación de por qué considerar este diagnóstico"
    }
  ],
  "redFlags": [
    {
      "symptom": "síntoma o hallazgo preocupante",
      "implication": "qué podría indicar y acción requerida"
    }
  ],
  "physicalExam": [
    {
      "system": "sistema a examinar",
      "specificTests": "exámenes o maniobras específicas",
      "lookFor": "qué buscar o evaluar"
    }
  ],
  "initialWorkup": [
    {
      "category": "laboratorio/imagen/otro",
      "test": "nombre del examen",
      "indication": "por qué está indicado"
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

    const requestData: SymptomRequest = await req.json();
    const { symptoms, patientAge, patientGender, medicalHistory, currentMedications, provider = 'gemini' } = requestData;

    if (!symptoms) {
      throw new Error('Symptoms are required');
    }

    // Build context for analysis
    let patientContext = `Síntomas presentados: ${symptoms}`;
    if (patientAge) patientContext += `\nEdad: ${patientAge} años`;
    if (patientGender) patientContext += `\nGénero: ${patientGender}`;
    if (medicalHistory) patientContext += `\nAntecedentes médicos: ${medicalHistory}`;
    if (currentMedications) patientContext += `\nMedicamentos actuales: ${currentMedications}`;

    let analysisResult;

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
              text: `${SYMPTOM_ANALYSIS_PROMPT}\n\nInformación del paciente:\n${patientContext}`
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
        throw new Error('No analysis generated by Gemini');
      }

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON format in Gemini response');
      }

      analysisResult = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('OpenAI provider not yet implemented for symptom analysis');
    }

    // Log the analysis action
    await supabase.from('app_usage_logs').insert({
      user_id: user.id,
      action: 'symptom_analysis_generated',
      details: {
        provider,
        symptoms_length: symptoms.length,
        patient_info_provided: {
          age: !!patientAge,
          gender: !!patientGender,
          medical_history: !!medicalHistory,
          current_medications: !!currentMedications
        }
      }
    });

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      provider
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to analyze symptoms'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});