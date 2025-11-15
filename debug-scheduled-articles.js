// Debug scheduled articles query
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugScheduledArticles() {
  try {
    const now = new Date().toISOString();
    console.log(`Current time (ISO): ${now}`);
    console.log('');

    // Get all scheduled articles
    const { data: allScheduled, error: allError } = await supabase
      .from('articles')
      .select('id, title, scheduled_at, status')
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true });

    if (allError) {
      console.error('Error:', allError);
      return;
    }

    console.log(`Total scheduled articles: ${allScheduled?.length || 0}`);
    console.log('');

    if (allScheduled && allScheduled.length > 0) {
      allScheduled.forEach((article, index) => {
        const scheduledTime = new Date(article.scheduled_at);
        const currentTime = new Date(now);
        const isPast = scheduledTime <= currentTime;

        console.log(`${index + 1}. ${article.title}`);
        console.log(`   Scheduled: ${article.scheduled_at}`);
        console.log(`   Is Past Due: ${isPast ? '✅ YES' : '❌ NO'}`);
        if (!isPast) {
          const diff = scheduledTime - currentTime;
          const minutesUntil = Math.floor(diff / 60000);
          console.log(`   Time until: ${minutesUntil} minutes`);
        }
        console.log('');
      });
    }

    // Now run the exact same query the cron job uses
    console.log('=== RUNNING CRON JOB QUERY ===');
    const { data: scheduledArticles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, project_id, scheduled_at, slug, content, meta_description')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true });

    if (fetchError) {
      console.error('Error:', fetchError);
      return;
    }

    console.log(`Articles matching cron query (lte ${now}):`);
    console.log(`Count: ${scheduledArticles?.length || 0}`);

    if (scheduledArticles && scheduledArticles.length > 0) {
      scheduledArticles.forEach((article) => {
        console.log(`  - ${article.title} (${article.scheduled_at})`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugScheduledArticles();
