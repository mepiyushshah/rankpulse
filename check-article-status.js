// Check the status of our test article
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticle() {
  try {
    const { data: article } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', 'test-auto-publish-morning-yoga-1763201282716')
      .single();

    if (article) {
      console.log('\n📄 Article Status:');
      console.log('─'.repeat(80));
      console.log(`Title: ${article.title}`);
      console.log(`Status: ${article.status}`);
      console.log(`Scheduled At: ${article.scheduled_at}`);
      console.log(`Published At: ${article.published_at || 'Not published yet'}`);
      console.log(`Published URL: ${article.published_url || 'Not published yet'}`);
      console.log(`WordPress Post ID: ${article.cms_post_id || 'Not published yet'}`);
      console.log('\n📅 Time Check:');
      console.log(`Current Time (UTC): ${new Date().toISOString()}`);
      console.log(`Scheduled Time (UTC): ${article.scheduled_at}`);

      const scheduledTime = new Date(article.scheduled_at);
      const now = new Date();
      const diff = now - scheduledTime;
      const minutesAgo = Math.floor(diff / 60000);

      if (diff > 0) {
        console.log(`✅ Article is ${minutesAgo} minutes past scheduled time (ready to publish)`);
      } else {
        console.log(`⏰ Article is scheduled ${Math.abs(minutesAgo)} minutes from now`);
      }
    } else {
      console.log('Article not found');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkArticle();
