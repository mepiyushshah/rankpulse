const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data } = await supabase
    .from('articles')
    .select('title, content, word_count')
    .eq('id', '76192fed-813b-4e3b-a2f0-17a2a154f962')
    .single();

  if (data) {
    console.log('Title:', data.title);
    console.log('Has content:', data.content ? 'YES ✅' : 'NO ❌');
    console.log('Content length:', data.content?.length || 0);
    console.log('Word count:', data.word_count);
    if (data.content) {
      console.log('\nFirst 500 chars:');
      console.log(data.content.substring(0, 500) + '...');
    }
  }
})();
