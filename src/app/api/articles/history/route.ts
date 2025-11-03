import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's current project
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (projectError || !projects || projects.length === 0) {
      return NextResponse.json({ articles: [] });
    }

    const projectId = projects[0].id;

    // Fetch only published articles for the project, ordered by most recent first
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (error) {
    console.error('Error in articles history API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
