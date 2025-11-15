import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Auto-Publish Cron Job
 * This endpoint should be called every hour (or more frequently) by a cron service
 * to automatically publish scheduled articles when their scheduled_at time arrives
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    // Extract the token from "Bearer TOKEN" format
    const providedToken = authHeader?.replace('Bearer ', '');

    console.log('CRON_SECRET exists:', !!expectedSecret);
    console.log('Auth header exists:', !!authHeader);
    console.log('Tokens match:', providedToken === expectedSecret);

    if (!expectedSecret || providedToken !== expectedSecret) {
      console.error('Authorization failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role key to bypass RLS for cron jobs
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const now = new Date().toISOString();

    console.log('=== AUTO-PUBLISH CRON JOB STARTED ===');
    console.log('Current time:', now);

    // Find all articles that are scheduled and whose scheduled_at time has passed
    const { data: scheduledArticles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, project_id, scheduled_at, slug, content, meta_description')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching scheduled articles:', fetchError);
      throw fetchError;
    }

    if (!scheduledArticles || scheduledArticles.length === 0) {
      console.log('No articles scheduled for publishing at this time');
      return NextResponse.json({
        success: true,
        message: 'No articles to publish',
        published: 0,
        results: []
      });
    }

    console.log(`Found ${scheduledArticles.length} article(s) ready to publish`);

    const results = [];

    for (const article of scheduledArticles) {
      try {
        console.log(`\n--- Processing article: ${article.title} (ID: ${article.id}) ---`);
        console.log(`Scheduled for: ${article.scheduled_at}`);

        // Get project's WordPress integration
        const { data: integration } = await supabase
          .from('cms_connections')
          .select('*')
          .eq('project_id', article.project_id)
          .eq('platform', 'wordpress')
          .eq('status', 'active')
          .single();

        if (!integration) {
          console.log('❌ No active WordPress integration found for this project');
          results.push({
            articleId: article.id,
            title: article.title,
            status: 'failed',
            error: 'No active WordPress integration'
          });

          // Update article status to draft (failed to publish)
          await supabase
            .from('articles')
            .update({
              status: 'draft',
              updated_at: new Date().toISOString()
            })
            .eq('id', article.id);

          continue;
        }

        console.log(`✓ Found WordPress integration: ${integration.name}`);

        // Publish to WordPress using the API
        console.log('Publishing to WordPress...');
        const publishResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/articles/${article.id}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            integrationId: integration.id
          })
        });

        const publishData = await publishResponse.json();

        if (publishResponse.ok && publishData.success) {
          console.log(`✅ Successfully published to WordPress!`);
          console.log(`WordPress Post ID: ${publishData.postId}`);
          console.log(`Published URL: ${publishData.publishedUrl}`);

          results.push({
            articleId: article.id,
            title: article.title,
            status: 'success',
            wordpressPostId: publishData.postId,
            publishedUrl: publishData.publishedUrl
          });

          // Update article status to published
          await supabase
            .from('articles')
            .update({
              status: 'published',
              published_at: now,
              cms_post_id: publishData.postId.toString(),
              published_url: publishData.publishedUrl,
              updated_at: now
            })
            .eq('id', article.id);

          console.log('✓ Article status updated to published in database');
        } else {
          console.error(`❌ Failed to publish to WordPress:`, publishData);

          results.push({
            articleId: article.id,
            title: article.title,
            status: 'failed',
            error: publishData.error || 'Unknown error'
          });

          // Keep article as scheduled (will retry next cron run)
          // Or optionally update to draft if you want manual intervention
        }

      } catch (error: any) {
        console.error(`Error publishing article ${article.id}:`, error);
        results.push({
          articleId: article.id,
          title: article.title,
          status: 'error',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failureCount = results.filter(r => r.status !== 'success').length;

    console.log('\n=== AUTO-PUBLISH CRON JOB COMPLETED ===');
    console.log(`Total articles processed: ${results.length}`);
    console.log(`Successfully published: ${successCount}`);
    console.log(`Failed: ${failureCount}`);

    return NextResponse.json({
      success: true,
      message: `Published ${successCount} of ${results.length} scheduled articles`,
      published: successCount,
      failed: failureCount,
      results
    });

  } catch (error: any) {
    console.error('Error in auto-publish cron:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-publish articles' },
      { status: 500 }
    );
  }
}

// Also support GET method for easier testing
export async function GET(request: Request) {
  return POST(request);
}
