import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StructureRequest {
  transcription: string;
  provider?: 'gemini' | 'openai';
}

const MEDICAL_STRUCTURE_PROMPT = `
Eres un asistente médico experto. Tu tarea es tomar una transcripción de consulta médica y estructurarla en formato SOAP profesional.

INSTRUCCIONES CRÍTICAS:
- Analiza la transcripción médica proporcionada
- Extrae y organiza la información en exactamente estas 6 categorías
- Si no hay información para alguna categoría, escribe "No especificado" 
- Mantén un lenguaje médico profesional
- Sé preciso y conciso

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "subjetivo": "Motivo de consulta y síntomas del paciente",
  "objetivo": "Historia de la enfermedad actual y antecedentes relevantes", 
  "examenFisico": "Hallazgos del examen físico y signos vitales",
  "impresionDiagnostica": "Diagnóstico diferencial o impresión diagnóstica",
  "plan": "Plan de tratamiento, medicamentos, seguimiento",
  "analisisDelCaso": "Resumen ejecutivo y consideraciones clínicas"
}

Transcripción a estructurar:
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription, provider = 'gemini' }: StructureRequest = await req.json();

    if (!transcription) {
      throw new Error('Transcription is required');
    }

    console.log(`Using ${provider} for consultation structuring`);

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
              text: MEDICAL_STRUCTURE_PROMPT + transcription
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${await response.text()}`);
      }

      const result = await response.json();
      const structuredText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON response
      const jsonMatch = structuredText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse structured consultation');
      }
      
      const structuredConsultation = JSON.parse(jsonMatch[0]);

      return new Response(
        JSON.stringify({ 
          structured: structuredConsultation,
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
            content: MEDICAL_STRUCTURE_PROMPT 
          },
          { 
            role: 'user', 
            content: transcription 
          }
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const result = await response.json();
    const structuredText = result.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = structuredText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse structured consultation');
    }
    
    const structuredConsultation = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ 
        structured: structuredConsultation,
        provider: 'openai',
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Structuring error:', error);
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