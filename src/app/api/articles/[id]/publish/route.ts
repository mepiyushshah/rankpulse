import { createClient } from '@/lib/supabase-server';
import { createWordPressClient } from '@/lib/wordpress-client';
import { NextRequest, NextResponse } from 'next/server';
import { marked } from 'marked';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { integration_id, status = 'draft', categories, tags } = body;

    if (!integration_id) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 });
    }

    // Fetch the article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*, project:projects!inner(*)')
      .eq('id', id)
      .single();

    if (articleError || !article) {
      console.error('Error fetching article:', articleError);
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Verify user owns the project
    if (article.project.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch the integration
    const { data: integration, error: integrationError } = await supabase
      .from('cms_connections')
      .select('*')
      .eq('id', integration_id)
      .eq('project_id', article.project_id)
      .single();

    if (integrationError || !integration) {
      console.error('Error fetching integration:', integrationError);
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Only support WordPress for now
    if (integration.platform !== 'wordpress') {
      return NextResponse.json({
        error: 'Only WordPress publishing is supported'
      }, { status: 400 });
    }

    // Validate required fields
    if (!integration.api_url || !integration.api_key || !integration.api_secret) {
      return NextResponse.json({
        error: 'WordPress integration is missing required credentials'
      }, { status: 400 });
    }

    // Convert markdown content to HTML
    let htmlContent = marked(article.content || '');

    // Create WordPress client
    const wpClient = createWordPressClient(integration);

    // Process and upload images in the content
    console.log('Processing images in content...');
    htmlContent = await wpClient.processContentImages(htmlContent);

    // Prepare WordPress post data
    const wpPost = {
      title: article.title,
      content: htmlContent,
      excerpt: article.meta_description || '',
      status: status,
      slug: article.slug || undefined,
      categories: categories || [],
      tags: tags || [],
      meta: article.schema_markup ? {
        schema_markup: JSON.stringify(article.schema_markup)
      } : undefined,
    };

    // Check if article was already published (update instead of create)
    if (article.cms_post_id) {
      console.log(`Updating existing WordPress post: ${article.cms_post_id}`);
      const updateResult = await wpClient.updatePost(parseInt(article.cms_post_id), wpPost);

      if (!updateResult.success) {
        console.error('WordPress update failed:', updateResult.error);
        return NextResponse.json({
          success: false,
          error: updateResult.error || 'Failed to update WordPress post'
        }, { status: 400 });
      }

      // Update article with new published URL
      const publishedUrl = updateResult.data?.link || article.published_url;

      const { error: updateError } = await supabase
        .from('articles')
        .update({
          published_url: publishedUrl,
          status: status === 'publish' ? 'published' : article.status,
          published_at: status === 'publish' ? new Date().toISOString() : article.published_at,
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating article in database:', updateError);
      }

      return NextResponse.json({
        success: true,
        data: {
          post_id: article.cms_post_id,
          url: publishedUrl,
          status: updateResult.data?.status,
          action: 'updated'
        }
      });
    }

    // Create new WordPress post
    console.log(`Creating new WordPress post: ${article.title}`);
    const result = await wpClient.createPost(wpPost);

    if (!result.success) {
      console.error('WordPress publish failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to publish to WordPress'
      }, { status: 400 });
    }

    // Update article with WordPress post ID and URL
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        cms_post_id: result.data.id.toString(),
        published_url: result.data.link,
        status: status === 'publish' ? 'published' : article.status,
        published_at: status === 'publish' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating article in database:', updateError);
      // Still return success since WordPress publish worked
    }

    return NextResponse.json({
      success: true,
      data: {
        post_id: result.data.id,
        url: result.data.link,
        status: result.data.status,
        action: 'created'
      }
    });
  } catch (error) {
    console.error('Error in POST /api/articles/[id]/publish:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
