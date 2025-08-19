import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  patientId: string;
  question: string;
  provider?: 'gemini' | 'openai';
}

const PATIENT_CHAT_PROMPT = `
Eres un asistente médico especializado. Tu función es analizar el historial médico completo de un paciente específico y responder preguntas basándote ÚNICAMENTE en la información proporcionada.

REGLAS CRÍTICAS:
- Solo responde basándote en el historial médico proporcionado
- Si no tienes la información específica, di claramente "No tengo esa información en el historial disponible"
- Mantén un tono profesional médico
- Sé preciso y conciso
- NO inventes información
- NO des consejos médicos generales, solo analiza los datos del historial

Historial médico del paciente:
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientId, question, provider = 'gemini' }: ChatRequest = await req.json();

    if (!patientId || !question) {
      throw new Error('Patient ID and question are required');
    }

    // Get authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('Missing authorization header');
    }

    // Get Supabase client with user auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authorization } }
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Invalid or expired authentication token');
    }

    // Get patient's complete medical history
    const { data: consultations, error } = await supabase
      .from('consultations')
      .select(`
        id,
        consultation_date,
        chief_complaint,
        history_present_illness,
        physical_examination,
        assessment,
        plan,
        notes,
        patients!inner(first_name, last_name, medical_history, allergies, current_medications)
      `)
      .eq('patient_id', patientId)
      .order('consultation_date', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!consultations || consultations.length === 0) {
      return new Response(
        JSON.stringify({ 
          response: "No tengo historial médico disponible para este paciente.",
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build patient history context
    const patient = consultations[0].patients;
    let historyContext = `PACIENTE: ${patient.first_name} ${patient.last_name}\n\n`;
    
    if (patient.medical_history) {
      historyContext += `ANTECEDENTES MÉDICOS: ${patient.medical_history}\n\n`;
    }
    if (patient.allergies) {
      historyContext += `ALERGIAS: ${patient.allergies}\n\n`;
    }
    if (patient.current_medications) {
      historyContext += `MEDICACIONES ACTUALES: ${patient.current_medications}\n\n`;
    }

    historyContext += "HISTORIAL DE CONSULTAS:\n\n";

    consultations.forEach((consultation, index) => {
      historyContext += `CONSULTA ${index + 1} - ${new Date(consultation.consultation_date).toLocaleDateString()}:\n`;
      if (consultation.chief_complaint) historyContext += `Motivo: ${consultation.chief_complaint}\n`;
      if (consultation.history_present_illness) historyContext += `Historia: ${consultation.history_present_illness}\n`;
      if (consultation.physical_examination) historyContext += `Examen: ${consultation.physical_examination}\n`;
      if (consultation.assessment) historyContext += `Evaluación: ${consultation.assessment}\n`;
      if (consultation.plan) historyContext += `Plan: ${consultation.plan}\n`;
      if (consultation.notes) historyContext += `Notas: ${consultation.notes}\n`;
      historyContext += "\n";
    });

    console.log(`Using ${provider} for patient chat`);

    if (provider === 'gemini') {
      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: PATIENT_CHAT_PROMPT + historyContext + "\n\nPREGUNTA: " + question
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${await response.text()}`);
      }

      const result = await response.json();
      const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          provider: 'gemini',
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback to OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('No AI provider available');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: PATIENT_CHAT_PROMPT + historyContext 
          },
          { 
            role: 'user', 
            content: question 
          }
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        provider: 'openai',
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Patient chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});