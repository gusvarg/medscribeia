import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadRequest {
  audioBlob: string; // base64 encoded
  fileName?: string;
  consultationId?: string;
}

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

    const { audioBlob, fileName = 'recording.webm', consultationId }: UploadRequest = await req.json();

    if (!audioBlob) {
      throw new Error('No audio data provided');
    }

    // Convert base64 to binary
    const binaryString = atob(audioBlob);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create file path with user ID folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `${user.id}/${timestamp}-${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medscribe-audio')
      .upload(filePath, bytes, {
        contentType: 'audio/webm',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    // Create database record
    const { data: recordData, error: recordError } = await supabase
      .from('audio_recordings')
      .insert({
        user_id: user.id,
        consultation_id: consultationId || null,
        file_path: filePath,
        file_size: bytes.length,
        transcription_status: 'pending'
      })
      .select()
      .single();

    if (recordError) {
      console.error('Database insert error:', recordError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('medscribe-audio').remove([filePath]);
      throw new Error(`Failed to create audio record: ${recordError.message}`);
    }

    // Log action
    await supabase.from('app_usage_logs').insert({
      user_id: user.id,
      action: 'audio_uploaded',
      details: {
        recording_id: recordData.id,
        file_size: bytes.length,
        consultation_id: consultationId
      }
    });

    console.log(`Audio uploaded successfully: ${recordData.id}`);

    return new Response(JSON.stringify({
      success: true,
      recordingId: recordData.id,
      filePath: filePath
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Upload audio error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to upload audio'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});