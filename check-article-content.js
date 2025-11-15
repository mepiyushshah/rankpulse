// Check if tomorrow's article has content or just title
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticleContent() {
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('title', 'Article: yoga for beginners')
    .single();

  if (article) {
    console.log('📄 Article: yoga for beginners');
    console.log('─'.repeat(60));
    console.log(`Title: ${article.title}`);
    console.log(`Slug: ${article.slug || 'Not set'}`);
    console.log(`Created at: ${article.created_at}`);
    console.log(`Scheduled to publish: ${article.scheduled_at}`);
    console.log(`Status: ${article.status}`);
    console.log(`\nContent exists: ${article.content ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Content length: ${article.content?.length || 0} characters`);
    console.log(`Word count: ${article.word_count || 'Unknown'}`);

    if (article.content) {
      console.log('\n📝 Content preview (first 500 chars):');
      console.log('─'.repeat(60));
      console.log(article.content.substring(0, 500) + '...');
    } else {
      console.log('\n❌ This article has NO CONTENT yet!');
      console.log('It needs to be generated before it can be published.');
    }
  } else {
    console.log('Article not found');
  }
}

checkArticleContent();
