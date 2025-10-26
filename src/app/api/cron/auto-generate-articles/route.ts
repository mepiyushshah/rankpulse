import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
 * to automatically generate articles based on user settings
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all projects with auto-generation enabled
    const { data: settings } = await supabase
      .from('article_settings')
      .select('*, projects(id, name, user_id)')
      .eq('auto_generate', true);

    if (!settings || settings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No projects with auto-generation enabled',
        generated: 0
      });
    }

    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentHour = new Date().getHours();

    const results = [];

    for (const setting of settings) {
      try {
        const project = setting.projects;

        // Check if today is a preferred day
        if (!setting.preferred_days || !setting.preferred_days.includes(today)) {
          continue;
        }

        // Check if current time matches publish time (within 1 hour window)
        const [publishHour] = (setting.publish_time || '09:00:00').split(':').map(Number);
        if (Math.abs(currentHour - publishHour) > 1) {
          continue;
        }

        // Check how many articles were generated this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const { data: weekArticles } = await supabase
          .from('articles')
          .select('id')
          .eq('project_id', project.id)
          .gte('created_at', weekStart.toISOString());

        const articlesThisWeek = weekArticles?.length || 0;
        const targetPerWeek = setting.articles_per_week || 3;

        if (articlesThisWeek >= targetPerWeek) {
          continue; // Already met weekly quota
        }

        // Get content plan keywords that haven't been used yet
        const { data: unusedKeywords } = await supabase
          .from('content_ideas')
          .select('id, keyword, content_type, difficulty')
          .eq('project_id', project.id)
          .is('article_id', null)
          .order('created_at', { ascending: true })
          .limit(1);

        if (!unusedKeywords || unusedKeywords.length === 0) {
          continue; // No keywords available
        }

        const keywordData = unusedKeywords[0];

        // Create article entry
        const { data: newArticle, error: articleError } = await supabase
          .from('articles')
          .insert({
            project_id: project.id,
            keyword: keywordData.keyword,
            content_type: keywordData.content_type,
            difficulty: keywordData.difficulty,
            status: 'generating',
          })
          .select()
          .single();

        if (articleError || !newArticle) {
          console.error('Failed to create article:', articleError);
          continue;
        }

        // Link the content idea to this article
        await supabase
          .from('content_ideas')
          .update({ article_id: newArticle.id })
          .eq('id', keywordData.id);

        // Generate the article using the same logic as manual generation
        // (We'll call the existing generate-article endpoint internally)
        const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-article`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            articleId: newArticle.id,
            keyword: keywordData.keyword,
            contentType: keywordData.content_type,
          })
        });

        if (generateResponse.ok) {
          results.push({
            projectId: project.id,
            projectName: project.name,
            articleId: newArticle.id,
            keyword: keywordData.keyword,
            status: 'success'
          });

          // Auto-publish if enabled
          if (setting.auto_publish) {
            await supabase
              .from('articles')
              .update({
                status: 'published',
                published_at: new Date().toISOString()
              })
              .eq('id', newArticle.id);
          }
        } else {
          results.push({
            projectId: project.id,
            projectName: project.name,
            articleId: newArticle.id,
            keyword: keywordData.keyword,
            status: 'failed'
          });
        }

      } catch (error) {
        console.error('Error processing project:', error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      generated: results.length,
      results
    });

  } catch (error: any) {
    console.error('Error in auto-generation cron:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-generate articles' },
      { status: 500 }
    );
  }
}
