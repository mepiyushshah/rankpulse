// Check detailed settings for a user
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings(email) {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (!profile) {
      console.log('❌ User not found');
      return;
    }

    // Get projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', profile.id);

    for (const project of projects) {
      console.log(`\n📋 Project: ${project.name}`);
      console.log('═'.repeat(80));

      // Get article settings - check all columns
      const { data: settings, error } = await supabase
        .from('article_settings')
        .select('*')
        .eq('project_id', project.id)
        .single();

      if (error) {
        console.log('Error:', error);
      } else if (settings) {
        console.log('\n⚙️  Article Settings (Raw Data):');
        console.log(JSON.stringify(settings, null, 2));
      }

      // Check CMS integrations
      const { data: integrations } = await supabase
        .from('cms_connections')
        .select('*')
        .eq('project_id', project.id);

      if (integrations && integrations.length > 0) {
        console.log('\n\n🔌 CMS Integrations:');
        integrations.forEach(int => {
          console.log(`\nPlatform: ${int.platform}`);
          console.log(`Status: ${int.status}`);
          console.log(`Name: ${int.name || 'N/A'}`);
          console.log(`API URL: ${int.api_url || 'N/A'}`);
        });
      } else {
        console.log('\n\n🔌 CMS Integrations: None');
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSettings('piyush.shah2212@gmail.com');
