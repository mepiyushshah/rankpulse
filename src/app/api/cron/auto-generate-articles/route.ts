import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * SIMPLE Auto-Generate Cron Job
 * Finds scheduled articles with empty content and generates them
 * Runs every 30 minutes
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('=== AUTO-GENERATE CRON STARTED ===');

    // Find articles that need content (empty or null content, status = scheduled)
    const { data: emptyArticles, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'scheduled')
      .or('content.is.null,content.eq.')
      .order('scheduled_at', { ascending: true })  // Prioritize by schedule date
      .limit(5);  // Max 5 articles per run to avoid timeout

    if (fetchError) {
      console.error('Error fetching empty articles:', fetchError);
      throw fetchError;
    }

    if (!emptyArticles || emptyArticles.length === 0) {
      console.log('No articles need content generation');
      return NextResponse.json({
        success: true,
        message: 'No articles to generate',
        generated: 0,
        results: []
      });
    }

    console.log(`Found ${emptyArticles.length} article(s) needing content`);

    const results = [];

    for (const article of emptyArticles) {
      try {
        console.log(`\nGenerating content for: ${article.title}`);
        console.log(`  Keyword: ${article.target_keyword}`);
        console.log(`  Scheduled: ${article.scheduled_at}`);

        // Call generate-article API
        const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-article`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId: article.id,
            keyword: article.target_keyword || article.title,
            contentType: article.content_type || 'Article',
          })
        });

        if (generateResponse.ok) {
          console.log(`✅ Successfully generated: ${article.title}`);
          results.push({
            articleId: article.id,
            title: article.title,
            keyword: article.target_keyword,
            status: 'success'
          });
        } else {
          const errorData = await generateResponse.json();
          console.error(`❌ Failed to generate: ${article.title}`, errorData);
          results.push({
            articleId: article.id,
            title: article.title,
            keyword: article.target_keyword,
            status: 'failed',
            error: errorData.error || 'Generation failed'
          });
        }

      } catch (error: any) {
        console.error(`Error generating article ${article.id}:`, error);
        results.push({
          articleId: article.id,
          title: article.title,
          status: 'error',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`\n=== AUTO-GENERATE COMPLETED ===`);
    console.log(`Total processed: ${results.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${results.length - successCount}`);

    return NextResponse.json({
      success: true,
      message: `Generated ${successCount} of ${results.length} articles`,
      generated: successCount,
      results
    });

  } catch (error: any) {
    console.error('Error in auto-generate cron:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-generate articles' },
      { status: 500 }
    );
  }
}
