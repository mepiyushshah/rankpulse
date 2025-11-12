import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Fetch all sitemap articles for a project
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');

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

    // Build query
    let query = supabase
      .from('sitemap_articles')
      .select('id, url, title, last_modified, priority, discovered_at')
      .eq('project_id', projectId)
      .order('priority', { ascending: false, nullsFirst: false })
      .order('last_modified', { ascending: false, nullsFirst: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,url.ilike.%${search}%`);
    }

    // Add limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Error fetching sitemap articles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sitemap articles' },
        { status: 500 }
      );
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (error) {
    console.error('Error in GET /api/sitemaps/articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
