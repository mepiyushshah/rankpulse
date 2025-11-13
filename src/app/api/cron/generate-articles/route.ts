import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * Cron Job: Auto-Generate Articles
 *
 * Runs every 30 minutes via Vercel Cron
 *
 * Logic:
 * 1. Finds all projects with auto_generate enabled
 * 2. For each project, finds articles scheduled for TOMORROW at the publish time
 * 3. Generates articles 1 day before so user can review
 * 4. If auto_publish is enabled, publishes to WordPress after generation
 * 5. Implements automatic retries on failure
 */
export async function GET(request: Request) {
  try {
    // Verify this is a cron request (Vercel sets this header)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 ===== CRON JOB STARTED =====');
    console.log(`🕐 Time: ${new Date().toISOString()}`);

    const supabase = await createClient();

    // Get all projects with auto_generate enabled
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        user_id,
        article_settings (
          auto_generate,
          publish_time,
          auto_publish
        )
      `)
      .eq('article_settings.auto_generate', true);

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
      throw projectsError;
    }

    if (!projects || projects.length === 0) {
      console.log('ℹ️  No projects with auto-generation enabled');
      return NextResponse.json({
        success: true,
        message: 'No projects with auto-generation enabled',
        processed: 0,
      });
    }

    console.log(`📊 Found ${projects.length} project(s) with auto-generation enabled`);

    let totalProcessed = 0;
    let totalGenerated = 0;
    let totalPublished = 0;
    let totalFailed = 0;

    // Process each project
    for (const project of projects) {
      try {
        console.log(`\n🔄 Processing project: ${project.name} (${project.id})`);

        const settings = Array.isArray(project.article_settings)
          ? project.article_settings[0]
          : project.article_settings;

        if (!settings) {
          console.log('⚠️  No settings found, skipping');
          continue;
        }

        const publishTime = settings.publish_time || '09:00:00';
        const autoPublish = settings.auto_publish || false;

        console.log(`⚙️  Settings: Publish Time: ${publishTime}, Auto-Publish: ${autoPublish}`);

        // Calculate tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);

        console.log(`📅 Looking for articles scheduled for: ${tomorrow.toDateString()}`);

        // Find all articles scheduled for TOMORROW that are still in 'scheduled' status
        const { data: articles, error: articlesError } = await supabase
          .from('articles')
          .select('*')
          .eq('project_id', project.id)
          .eq('status', 'scheduled')
          .gte('scheduled_at', tomorrow.toISOString())
          .lte('scheduled_at', tomorrowEnd.toISOString());

        if (articlesError) {
          console.error(`❌ Error fetching articles for project ${project.id}:`, articlesError);
          continue;
        }

        if (!articles || articles.length === 0) {
          console.log('ℹ️  No scheduled articles found for tomorrow');
          continue;
        }

        console.log(`📝 Found ${articles.length} article(s) to generate`);

        // Generate each article
        for (const article of articles) {
          totalProcessed++;

          try {
            console.log(`\n  🎯 Generating article: ${article.target_keyword}`);

            // Call the generate-article API with retries
            let attempt = 0;
            let success = false;
            let lastError: any = null;

            while (attempt < 3 && !success) {
              attempt++;
              console.log(`  📡 Attempt ${attempt}/3...`);

              try {
                const generateResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate-article`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      projectId: project.id,
                      articleId: article.id,
                      keyword: article.target_keyword,
                      contentType: article.content_type,
                    }),
                  }
                );

                if (generateResponse.ok) {
                  success = true;
                  totalGenerated++;
                  console.log(`  ✅ Article generated successfully!`);

                  // If auto-publish is enabled, publish to WordPress
                  if (autoPublish) {
                    console.log(`  📤 Auto-publishing to WordPress...`);

                    // Get WordPress integration
                    const { data: integrations } = await supabase
                      .from('cms_connections')
                      .select('*')
                      .eq('project_id', project.id)
                      .eq('platform', 'wordpress')
                      .limit(1);

                    if (integrations && integrations.length > 0) {
                      const integration = integrations[0];

                      const publishResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles/${article.id}/publish`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            integration_id: integration.id,
                            status: 'publish',
                          }),
                        }
                      );

                      if (publishResponse.ok) {
                        totalPublished++;
                        console.log(`  ✅ Article published to WordPress!`);
                      } else {
                        const publishError = await publishResponse.json();
                        console.error(`  ❌ Failed to publish:`, publishError.error);
                      }
                    } else {
                      console.log(`  ⚠️  No WordPress integration found, skipping publish`);
                    }
                  }
                } else {
                  const errorData = await generateResponse.json();
                  lastError = errorData.error || 'Unknown error';
                  console.error(`  ❌ Attempt ${attempt} failed:`, lastError);

                  if (attempt < 3) {
                    // Wait before retry (exponential backoff)
                    const waitTime = attempt * 2000; // 2s, 4s, 6s
                    console.log(`  ⏳ Waiting ${waitTime}ms before retry...`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime));
                  }
                }
              } catch (fetchError: any) {
                lastError = fetchError.message;
                console.error(`  ❌ Attempt ${attempt} error:`, fetchError.message);

                if (attempt < 3) {
                  const waitTime = attempt * 2000;
                  console.log(`  ⏳ Waiting ${waitTime}ms before retry...`);
                  await new Promise((resolve) => setTimeout(resolve, waitTime));
                }
              }
            }

            if (!success) {
              totalFailed++;
              console.error(`  ❌ FAILED after 3 attempts: ${lastError}`);

              // Log failure to database for monitoring
              await supabase.from('generation_logs').insert({
                project_id: project.id,
                article_id: article.id,
                status: 'failed',
                error: lastError,
                attempts: 3,
                created_at: new Date().toISOString(),
              });
            }
          } catch (articleError: any) {
            totalFailed++;
            console.error(`  ❌ Error processing article ${article.id}:`, articleError.message);
          }
        }
      } catch (projectError: any) {
        console.error(`❌ Error processing project ${project.id}:`, projectError.message);
      }
    }

    console.log('\n🎉 ===== CRON JOB COMPLETED =====');
    console.log(`📊 Summary:`);
    console.log(`   - Projects processed: ${projects.length}`);
    console.log(`   - Articles processed: ${totalProcessed}`);
    console.log(`   - Successfully generated: ${totalGenerated}`);
    console.log(`   - Published to WordPress: ${totalPublished}`);
    console.log(`   - Failed: ${totalFailed}`);

    return NextResponse.json({
      success: true,
      message: 'Cron job completed successfully',
      stats: {
        projects: projects.length,
        processed: totalProcessed,
        generated: totalGenerated,
        published: totalPublished,
        failed: totalFailed,
      },
    });
  } catch (error: any) {
    console.error('❌ CRON JOB ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
