-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a scheduled job to clean up old audio recordings every day at 2 AM
SELECT cron.schedule(
  'cleanup-old-audio',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://pkmmqwcjwebszfugkmlr.supabase.co/functions/v1/cleanup-audio',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrbW1xd2Nqd2Vic3pmdWdrbWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mzk5MjcsImV4cCI6MjA3MTExNTkyN30.w3TBzxq5OVFBkRx9rhdaTlbhY1_-zDCsLfulgNYe-Hk"}'::jsonb,
        body:=concat('{"scheduled": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);