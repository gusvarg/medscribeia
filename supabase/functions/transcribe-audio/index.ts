import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscribeRequest {
  audio: string; // Base64 encoded audio
  provider?: 'gemini' | 'openai';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, provider = 'gemini' }: TranscribeRequest = await req.json();

    if (!audio) {
      throw new Error('Audio data is required');
    }

    console.log(`Using ${provider} for transcription`);

    if (provider === 'gemini') {
      // Use Gemini for transcription
      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      // Convert base64 to blob for Gemini
      const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Transcribe this medical audio recording in Spanish. Return only the transcribed text, no additional commentary."
              },
              {
                inline_data: {
                  mime_type: "audio/webm",
                  data: audio
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${await response.text()}`);
      }

      const result = await response.json();
      const transcription = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return new Response(
        JSON.stringify({ 
          transcription,
          provider: 'gemini',
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback to OpenAI Whisper (if OPENAI_API_KEY exists)
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('No transcription provider available');
    }

    const binaryAudio = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ 
        transcription: result.text,
        provider: 'openai',
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Transcription error:', error);
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