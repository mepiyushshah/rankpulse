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

    // Convert markdown content to HTML with WordPress-safe options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });

    let htmlContent = await marked(article.content || '');

    // Clean up the HTML for WordPress compatibility
    // Remove any comments that might cause issues
    htmlContent = htmlContent.replace(/<!--[\s\S]*?-->/g, '');

    // Fix table structure: wrap in figure, add proper thead/tbody, and style cells
    htmlContent = htmlContent.replace(
      /<table>([\s\S]*?)<\/table>/gi,
      (match, tableContent) => {
        // Add modern, professional inline styles to cells
        let styledContent = tableContent
          .replace(/<th>/gi, '<th style="border-bottom: 2px solid #2563eb; padding: 14px 16px; background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%); font-weight: 600; text-align: left; color: #fff !important; font-size: 15px; letter-spacing: 0.3px;">')
          .replace(/<td>/gi, '<td style="border-bottom: 1px solid #e5e7eb; padding: 12px 16px; background-color: #fff; color: #1f2937 !important; font-size: 14px; line-height: 1.6;">');

        // Check if table has thead/tbody already
        if (styledContent.includes('<thead>')) {
          // Already has proper structure, just wrap it
          return `<figure class="wp-block-table" style="margin: 2em 0; overflow-x: auto;"><table class="has-fixed-layout" style="border-collapse: collapse; width: 100%; background-color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">${styledContent}</table></figure>`;
        }

        // Split into rows
        const rows = styledContent.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);

        if (!rows || rows.length === 0) {
          return match; // Return original if can't parse
        }

        // First row with <th> tags is the header
        const headerRow = rows.find(row => row.includes('<th'));
        const bodyRows = rows.filter(row => row !== headerRow);

        let restructured = '<table class="has-fixed-layout" style="border-collapse: collapse; width: 100%; background-color: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">';

        if (headerRow) {
          restructured += `<thead>${headerRow}</thead>`;
        }

        if (bodyRows.length > 0) {
          restructured += `<tbody>${bodyRows.join('')}</tbody>`;
        }

        restructured += '</table>';

        return `<figure class="wp-block-table" style="margin: 2em 0; overflow-x: auto;">${restructured}</figure>`;
      }
    );

    // Create WordPress client
    const wpClient = createWordPressClient(integration);

    // Process and upload images in the content
    console.log('Processing images in content...');
    htmlContent = await wpClient.processContentImages(htmlContent);

    // Debug: Log the content before sending
    console.log('=== CONTENT TO WORDPRESS ===');
    console.log('Length:', htmlContent.length);
    console.log('First 200 chars:', htmlContent.substring(0, 200));
    console.log('Last 200 chars:', htmlContent.substring(htmlContent.length - 200));
    console.log('===========================');

    // Prepare WordPress post data - be very defensive about what we send
    const wpPost: any = {
      title: article.title,
      content: htmlContent,
      excerpt: article.meta_description || '',
      status: status,
    };

    // Only add optional fields if they have valid values
    if (article.slug && typeof article.slug === 'string' && article.slug.trim()) {
      wpPost.slug = article.slug;
    }

    if (categories && Array.isArray(categories) && categories.length > 0) {
      wpPost.categories = categories;
    }

    if (tags && Array.isArray(tags) && tags.length > 0) {
      wpPost.tags = tags;
    }

    // Skip meta/schema_markup for now - it might be causing the database error
    // if (article.schema_markup) {
    //   wpPost.meta = {
    //     schema_markup: JSON.stringify(article.schema_markup)
    //   };
    // }

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
