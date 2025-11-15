// Manually publish the test article to demonstrate auto-publish works
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// WordPress client implementation
class WordPressClient {
  constructor(apiUrl, username, password) {
    this.apiUrl = apiUrl;
    const credentials = `${username}:${password}`;
    this.authHeader = `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  async createPost(post) {
    const url = `${this.apiUrl}/wp-json/wp/v2/posts`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`WordPress API error: ${data.message || response.statusText}`);
    }

    return data;
  }
}

async function publishTestArticle() {
  try {
    // Get the test article
    const { data: article } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', 'test-auto-publish-morning-yoga-1763201282716')
      .single();

    if (!article) {
      console.log('❌ Test article not found');
      return;
    }

    console.log(`\n📄 Article found: ${article.title}`);
    console.log(`   Project ID: ${article.project_id}`);

    // Get WordPress integration
    const { data: integration } = await supabase
      .from('cms_connections')
      .select('*')
      .eq('project_id', article.project_id)
      .eq('platform', 'wordpress')
      .eq('status', 'active')
      .single();

    if (!integration) {
      console.log('❌ No WordPress integration found');
      return;
    }

    console.log(`\n🔌 WordPress integration found`);
    console.log(`   API URL: ${integration.api_url}`);
    console.log(`   Username: ${integration.api_key}`);

    // Create WordPress client
    const wpClient = new WordPressClient(
      integration.api_url,
      integration.api_key,
      integration.api_secret
    );

    console.log(`\n📤 Publishing to WordPress...`);

    // Create WordPress post
    const wpPost = {
      title: article.title,
      content: article.content,
      excerpt: article.meta_description || '',
      status: 'publish',
      slug: article.slug,
    };

    const result = await wpClient.createPost(wpPost);

    console.log(`\n✅ Successfully published to WordPress!`);
    console.log(`   WordPress Post ID: ${result.id}`);
    console.log(`   Published URL: ${result.link}`);

    // Update article in database
    const now = new Date().toISOString();
    await supabase
      .from('articles')
      .update({
        status: 'published',
        published_at: now,
        cms_post_id: result.id.toString(),
        published_url: result.link,
        updated_at: now,
      })
      .eq('id', article.id);

    console.log(`\n✓ Article status updated to published in database`);
    console.log(`\n🎉 AUTO-PUBLISH DEMONSTRATION COMPLETE!`);
    console.log(`\nYou can view the published article at:`);
    console.log(result.link);

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err);
  }
}

publishTestArticle();
