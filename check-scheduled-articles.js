// Check scheduled articles for a user
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkScheduledArticles(email) {
  try {
    // First get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.log('❌ User not found');
      return;
    }

    const userId = profile.id;

    // Get user's projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('user_id', userId);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log('❌ No projects found for this user');
      return;
    }

    console.log(`\n📊 Found ${projects.length} project(s) for ${email}\n`);

    // Get articles for each project
    for (const project of projects) {
      console.log(`\n🔍 Project: ${project.name}`);
      console.log('─'.repeat(80));

      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (articlesError) {
        console.error('Error fetching articles:', articlesError);
        continue;
      }

      if (!articles || articles.length === 0) {
        console.log('No articles found for this project\n');
        continue;
      }

      const scheduled = articles.filter(a => a.status === 'scheduled');
      const draft = articles.filter(a => a.status === 'draft');
      const published = articles.filter(a => a.status === 'published');

      console.log(`\n📈 Total Articles: ${articles.length}`);
      console.log(`   ✏️  Drafts: ${draft.length}`);
      console.log(`   ⏰ Scheduled: ${scheduled.length}`);
      console.log(`   ✅ Published: ${published.length}\n`);

      if (scheduled.length > 0) {
        console.log('\n⏰ SCHEDULED ARTICLES:\n');
        scheduled.forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
          console.log(`   Status: ${article.status}`);
          console.log(`   Created: ${new Date(article.created_at).toLocaleString()}`);
          console.log(`   Scheduled to publish: ${article.scheduled_at ? new Date(article.scheduled_at).toLocaleString() : 'Not set'}`);
          console.log(`   Word count: ${article.word_count || 'Unknown'}`);
          console.log('');
        });
      }

      if (draft.length > 0) {
        console.log('\n✏️  DRAFT ARTICLES:\n');
        draft.slice(0, 5).forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
          console.log(`   Created: ${new Date(article.created_at).toLocaleString()}`);
          console.log(`   Word count: ${article.word_count || 'Unknown'}`);
          console.log('');
        });
        if (draft.length > 5) {
          console.log(`   ... and ${draft.length - 5} more drafts\n`);
        }
      }

      if (published.length > 0) {
        console.log('\n✅ RECENTLY PUBLISHED:\n');
        published.slice(0, 3).forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
          console.log(`   Published: ${article.published_at ? new Date(article.published_at).toLocaleString() : 'Unknown'}`);
          console.log(`   URL: ${article.published_url || 'Not set'}`);
          console.log('');
        });
        if (published.length > 3) {
          console.log(`   ... and ${published.length - 3} more published\n`);
        }
      }
    }

    // Check content plan for auto-generation schedule
    console.log('\n\n🗓️  CHECKING AUTO-GENERATION SCHEDULE:\n');
    console.log('─'.repeat(80));

    for (const project of projects) {
      const { data: contentPlan, error: planError } = await supabase
        .from('content_plan')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (planError) {
        console.error('Error fetching content plan:', planError);
        continue;
      }

      if (contentPlan && contentPlan.length > 0) {
        console.log(`\n📋 Content Plan for "${project.name}":`);
        console.log(`   Total topics: ${contentPlan.length}`);

        const pending = contentPlan.filter(p => p.status === 'pending');
        const inProgress = contentPlan.filter(p => p.status === 'in_progress');
        const completed = contentPlan.filter(p => p.status === 'completed');

        console.log(`   Pending: ${pending.length}`);
        console.log(`   In Progress: ${inProgress.length}`);
        console.log(`   Completed: ${completed.length}`);

        if (pending.length > 0) {
          console.log('\n   Next topics to be generated:');
          pending.slice(0, 5).forEach((topic, index) => {
            console.log(`   ${index + 1}. ${topic.topic} (Priority: ${topic.priority})`);
          });
        }
      }
    }

    // Check article settings for auto-publish schedule
    console.log('\n\n⚙️  AUTO-PUBLISH SETTINGS:\n');
    console.log('─'.repeat(80));

    for (const project of projects) {
      const { data: settings, error: settingsError } = await supabase
        .from('article_settings')
        .select('*')
        .eq('project_id', project.id)
        .single();

      if (!settingsError && settings) {
        console.log(`\n📝 Settings for "${project.name}":`);
        console.log(`   Auto-publish enabled: ${settings.auto_publish_enabled ? '✅ Yes' : '❌ No'}`);
        if (settings.auto_publish_enabled) {
          console.log(`   Publish time: ${settings.auto_publish_time || 'Not set'}`);
          console.log(`   Days: ${settings.auto_publish_days ? settings.auto_publish_days.join(', ') : 'Not set'}`);
        }
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

const email = process.argv[2] || 'piyush.shah2212@gmail.com';
checkScheduledArticles(email);
