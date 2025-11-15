// Create a test article scheduled for immediate publishing
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestArticle(email) {
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

    // Get user's first project
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', profile.id)
      .limit(1);

    if (!projects || projects.length === 0) {
      console.log('❌ No projects found');
      return;
    }

    const project = projects[0];
    console.log(`\n📋 Using project: ${project.name}`);

    // Create a test article scheduled for right now (or 1 minute ago to ensure it's ready)
    const now = new Date();
    const scheduledTime = new Date(now.getTime() - 60000); // 1 minute ago

    const testArticle = {
      project_id: project.id,
      title: 'Test Auto-Publish: Benefits of Morning Yoga Practice',
      slug: 'test-auto-publish-morning-yoga-' + Date.now(),
      content: `<h2>Introduction</h2>
<p>Morning yoga is a transformative practice that can set a positive tone for your entire day. In this comprehensive guide, we'll explore the numerous benefits of establishing a morning yoga routine and how it can improve your physical and mental well-being.</p>

<h2>Physical Benefits</h2>
<p>Starting your day with yoga offers several physical advantages:</p>
<ul>
<li><strong>Increased Flexibility:</strong> Morning stretches help loosen tight muscles from sleep</li>
<li><strong>Better Posture:</strong> Regular practice strengthens core muscles and improves alignment</li>
<li><strong>Enhanced Energy:</strong> Gentle movement increases blood flow and oxygen circulation</li>
<li><strong>Improved Digestion:</strong> Certain poses stimulate the digestive system</li>
</ul>

<h2>Mental and Emotional Benefits</h2>
<p>Beyond physical health, morning yoga provides significant mental benefits:</p>
<ul>
<li>Reduces stress and anxiety levels</li>
<li>Improves focus and concentration</li>
<li>Promotes mindfulness and present-moment awareness</li>
<li>Boosts mood and emotional resilience</li>
</ul>

<h2>Best Morning Yoga Poses</h2>
<p>Here are some effective poses to include in your morning routine:</p>

<h3>1. Cat-Cow Pose (Marjaryasana-Bitilasana)</h3>
<p>This gentle flow warms up the spine and relieves back tension.</p>

<h3>2. Downward-Facing Dog (Adho Mukha Svanasana)</h3>
<p>A classic pose that stretches the entire body and energizes the mind.</p>

<h3>3. Sun Salutations (Surya Namaskar)</h3>
<p>A complete sequence that builds heat and prepares the body for the day ahead.</p>

<h2>Tips for Establishing a Morning Practice</h2>
<ol>
<li><strong>Start Small:</strong> Begin with just 10-15 minutes and gradually increase</li>
<li><strong>Be Consistent:</strong> Practice at the same time each morning</li>
<li><strong>Create Space:</strong> Designate a quiet area for your practice</li>
<li><strong>Listen to Your Body:</strong> Honor your limits and modify poses as needed</li>
<li><strong>Stay Hydrated:</strong> Drink water before and after your practice</li>
</ol>

<h2>Conclusion</h2>
<p>Incorporating yoga into your morning routine is a powerful way to invest in your health and well-being. Whether you're a beginner or experienced practitioner, the benefits of morning yoga are accessible to everyone. Start tomorrow morning and experience the transformation for yourself!</p>`,
      meta_description: 'Discover the powerful benefits of morning yoga practice, including improved flexibility, reduced stress, and enhanced mental clarity. Learn the best poses and tips to start your day right.',
      word_count: 450,
      language: 'en',
      status: 'scheduled',
      scheduled_at: scheduledTime.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    console.log(`\n🔨 Creating test article...`);
    console.log(`   Title: ${testArticle.title}`);
    console.log(`   Scheduled for: ${scheduledTime.toLocaleString()}`);
    console.log(`   Status: ${testArticle.status}`);

    const { data: article, error } = await supabase
      .from('articles')
      .insert([testArticle])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating article:', error);
      return;
    }

    console.log(`\n✅ Test article created successfully!`);
    console.log(`   Article ID: ${article.id}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`\n📌 This article is now ready to be auto-published!`);
    console.log(`\nNext step: Trigger the auto-publish cron job to publish it to WordPress`);

    return article;

  } catch (err) {
    console.error('Error:', err.message);
  }
}

createTestArticle('piyush.shah2212@gmail.com');
