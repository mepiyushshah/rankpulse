import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Fetch all sitemaps for a project
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch sitemaps with article count
    const { data: sitemaps, error } = await supabase
      .from('project_sitemaps')
      .select(`
        id,
        sitemap_url,
        last_parsed_at,
        article_count,
        status,
        error_message,
        created_at,
        updated_at
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sitemaps:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sitemaps' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sitemaps: sitemaps || [] });
  } catch (error) {
    console.error('Error in GET /api/sitemaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add and parse a new sitemap
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { projectId, sitemapUrl } = body;

    if (!projectId || !sitemapUrl) {
      return NextResponse.json(
        { error: 'Project ID and Sitemap URL are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(sitemapUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid sitemap URL format' },
        { status: 400 }
      );
    }

    // Verify user has access to this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Insert sitemap record
    const { data: sitemap, error: insertError } = await supabase
      .from('project_sitemaps')
      .insert({
        project_id: projectId,
        sitemap_url: sitemapUrl,
        status: 'parsing'
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'This sitemap URL already exists for this project' },
          { status: 409 }
        );
      }
      console.error('Error inserting sitemap:', insertError);
      return NextResponse.json(
        { error: 'Failed to add sitemap' },
        { status: 500 }
      );
    }

    // Parse sitemap in background
    parseSitemap(sitemap.id, projectId, sitemapUrl);

    return NextResponse.json({
      message: 'Sitemap added successfully and parsing started',
      sitemap
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/sitemaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a sitemap
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const sitemapId = searchParams.get('id');

    if (!sitemapId) {
      return NextResponse.json(
        { error: 'Sitemap ID is required' },
        { status: 400 }
      );
    }

    // Delete sitemap (cascade will delete related sitemap_articles)
    const { error } = await supabase
      .from('project_sitemaps')
      .delete()
      .eq('id', sitemapId);

    if (error) {
      console.error('Error deleting sitemap:', error);
      return NextResponse.json(
        { error: 'Failed to delete sitemap' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Sitemap deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/sitemaps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to parse URLs from a sitemap XML
function parseUrlsFromSitemap(xmlText: string, projectId: string, sitemapId: string) {
  const articles = [];
  const urlMatches = xmlText.matchAll(/<url>([\s\S]*?)<\/url>/g);

  for (const match of urlMatches) {
    const urlBlock = match[1];

    const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/);
    const lastmodMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/);
    const changefreqMatch = urlBlock.match(/<changefreq>(.*?)<\/changefreq>/);
    const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/);

    if (locMatch) {
      const url = locMatch[1].trim();

      // Skip sitemap XML files
      if (url.endsWith('.xml')) continue;

      // Extract title from URL (fallback)
      const urlParts = url.split('/').filter(Boolean);
      const slug = urlParts[urlParts.length - 1] || 'Homepage';
      const title = slug
        .replace(/\.html?$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      articles.push({
        project_id: projectId,
        sitemap_id: sitemapId,
        url,
        title,
        last_modified: lastmodMatch ? lastmodMatch[1] : null,
        change_frequency: changefreqMatch ? changefreqMatch[1] : null,
        priority: priorityMatch ? parseFloat(priorityMatch[1]) : null
      });
    }
  }

  return articles;
}

// Background function to parse sitemap
async function parseSitemap(sitemapId: string, projectId: string, sitemapUrl: string) {
  const supabase = await createClient();

  try {
    // Fetch sitemap XML
    const response = await fetch(sitemapUrl, {
      headers: {
        'User-Agent': 'RankPulse/1.0 (Sitemap Parser)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const articles = [];

    // Check if this is a sitemap index (contains <sitemap> tags)
    const sitemapIndexMatches = xmlText.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/g);
    const sitemapIndexArray = Array.from(sitemapIndexMatches);

    if (sitemapIndexArray.length > 0) {
      // This is a sitemap index - fetch all child sitemaps
      console.log(`📑 Detected sitemap index with ${sitemapIndexArray.length} child sitemaps`);

      const childSitemapUrls = [];
      for (const match of sitemapIndexArray) {
        const sitemapBlock = match[1];
        const locMatch = sitemapBlock.match(/<loc>(.*?)<\/loc>/);
        if (locMatch) {
          childSitemapUrls.push(locMatch[1].trim());
        }
      }

      // Fetch and parse each child sitemap
      for (const childUrl of childSitemapUrls.slice(0, 10)) { // Limit to first 10 sitemaps
        try {
          console.log(`⬇️  Fetching child sitemap: ${childUrl}`);
          const childResponse = await fetch(childUrl, {
            headers: { 'User-Agent': 'RankPulse/1.0 (Sitemap Parser)' }
          });

          if (!childResponse.ok) {
            console.log(`❌ Failed to fetch ${childUrl}: ${childResponse.status}`);
            continue;
          }

          const childXmlText = await childResponse.text();
          const childArticles = parseUrlsFromSitemap(childXmlText, projectId, sitemapId);
          console.log(`✅ Parsed ${childArticles.length} URLs from ${childUrl}`);
          articles.push(...childArticles);

          // Stop if we have enough articles
          if (articles.length >= 500) {
            console.log(`🛑 Reached limit of 500 articles, stopping`);
            break;
          }
        } catch (err) {
          console.error(`Failed to fetch child sitemap ${childUrl}:`, err);
          continue;
        }
      }
    } else {
      // This is a regular sitemap - parse URLs directly
      const parsedArticles = parseUrlsFromSitemap(xmlText, projectId, sitemapId);
      articles.push(...parsedArticles);
    }

    if (articles.length === 0) {
      throw new Error('No valid URLs found in sitemap. The sitemap may be empty or contain only index files.');
    }

    // Batch insert articles (handle duplicates)
    const { error: insertError } = await supabase
      .from('sitemap_articles')
      .upsert(articles, {
        onConflict: 'project_id,url',
        ignoreDuplicates: false
      });

    if (insertError) {
      throw insertError;
    }

    // Update sitemap status
    await supabase
      .from('project_sitemaps')
      .update({
        status: 'active',
        article_count: articles.length,
        last_parsed_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', sitemapId);

    console.log(`✅ Successfully parsed ${articles.length} URLs from sitemap ${sitemapId}`);
  } catch (error) {
    console.error('Error parsing sitemap:', error);

    // Update sitemap with error status
    await supabase
      .from('project_sitemaps')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      .eq('id', sitemapId);
  }
}
