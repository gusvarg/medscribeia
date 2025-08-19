import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Find audio recordings older than 48 hours that haven't been deleted
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const { data: expiredRecordings, error: fetchError } = await supabase
      .from('audio_recordings')
      .select('id, file_path, user_id')
      .lt('created_at', fortyEightHoursAgo.toISOString())
      .is('deleted_at', null);

    if (fetchError) {
      throw new Error(`Failed to fetch expired recordings: ${fetchError.message}`);
    }

    if (!expiredRecordings || expiredRecordings.length === 0) {
      console.log('No expired audio recordings found');
      return new Response(JSON.stringify({
        success: true,
        message: 'No expired recordings to clean up',
        deletedCount: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let deletedCount = 0;
    let errors = [];

    for (const recording of expiredRecordings) {
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('medscribe-audio')
          .remove([recording.file_path]);

        if (storageError) {
          console.error(`Failed to delete storage file ${recording.file_path}:`, storageError);
          errors.push(`Storage deletion failed for ${recording.id}: ${storageError.message}`);
          continue;
        }

        // Mark as deleted in database
        const { error: updateError } = await supabase
          .from('audio_recordings')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', recording.id);

        if (updateError) {
          console.error(`Failed to mark recording ${recording.id} as deleted:`, updateError);
          errors.push(`Database update failed for ${recording.id}: ${updateError.message}`);
          continue;
        }

        // Log cleanup action
        await supabase.from('app_usage_logs').insert({
          user_id: recording.user_id,
          action: 'audio_cleaned_up',
          details: {
            recording_id: recording.id,
            file_path: recording.file_path,
            cleanup_reason: '48h_expiry'
          }
        });

        deletedCount++;
        console.log(`Successfully cleaned up audio recording: ${recording.id}`);

      } catch (error) {
        console.error(`Error processing recording ${recording.id}:`, error);
        errors.push(`Processing failed for ${recording.id}: ${error.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Cleanup completed. Deleted ${deletedCount} recordings.`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Cleanup audio error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to cleanup audio recordings'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});