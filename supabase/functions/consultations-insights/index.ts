import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { startDate, endDate } = await req.json();

    console.log('Fetching consultations for date range:', { startDate, endDate, userId: user.id });

    // Fetch consultations for the date range
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
        patients (
          first_name,
          last_name,
          date_of_birth,
          gender,
          medical_history,
          allergies,
          current_medications
        )
      `)
      .eq('user_id', user.id)
      .gte('consultation_date', startDate)
      .lte('consultation_date', endDate)
      .order('consultation_date', { ascending: false });

    if (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }

    if (!consultations || consultations.length === 0) {
      return new Response(JSON.stringify({ 
        insights: 'No se encontraron consultas para el rango de fechas seleccionado.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${consultations.length} consultations for analysis`);

    // Prepare data for AI analysis
    const consultationsSummary = consultations.map(c => ({
      fecha: new Date(c.consultation_date).toLocaleDateString('es-ES'),
      paciente: `${c.patients.first_name} ${c.patients.last_name}`,
      edad: c.patients.date_of_birth ? 
        Math.floor((new Date().getTime() - new Date(c.patients.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
        'No disponible',
      genero: c.patients.gender || 'No especificado',
      motivo_consulta: c.chief_complaint || 'No especificado',
      diagnostico: c.assessment || 'No especificado',
      plan_tratamiento: c.plan || 'No especificado',
      antecedentes: c.patients.medical_history || 'No disponible',
      alergias: c.patients.allergies || 'No reportadas',
      medicamentos_actuales: c.patients.current_medications || 'No reportados'
    }));

    const prompt = `Eres un asistente médico especializado en análisis de consultas. Analiza las siguientes consultas médicas y proporciona un resumen e insights útiles para el médico:

CONSULTAS DEL PERIODO (${startDate} al ${endDate}):
${JSON.stringify(consultationsSummary, null, 2)}

Por favor, proporciona:
1. **Resumen General**: Número total de consultas, distribución por género y edad aproximada
2. **Patologías Más Frecuentes**: Los diagnósticos o motivos de consulta más comunes
3. **Insights Clínicos**: Patrones observados, posibles correlaciones, o tendencias importantes
4. **Recomendaciones**: Sugerencias para seguimiento, prevención o mejoras en la práctica médica

Mantén el análisis profesional, conciso y enfocado en información clínicamente relevante. Usa términos médicos apropiados pero comprensibles.`;

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response received successfully');
    
    const insights = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
      'No se pudo generar el análisis de las consultas.';

    return new Response(JSON.stringify({ 
      insights,
      totalConsultations: consultations.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in consultations-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Error interno del servidor',
      insights: 'Error al generar el análisis. Por favor, intenta nuevamente.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});