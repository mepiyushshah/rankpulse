import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get project_id from query params
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Fetch integrations for the project
    const { data: integrations, error } = await supabase
      .from('cms_connections')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching integrations:', error);
      return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
    }

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Error in GET /api/integrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      project_id,
      platform,
      name,
      api_url,
      api_key,
      api_secret,
      site_id,
      webhook_url,
      config
    } = body;

    // Validate required fields
    if (!project_id || !platform) {
      return NextResponse.json(
        { error: 'Project ID and platform are required' },
        { status: 400 }
      );
    }

    // Verify the project belongs to the user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create the integration
    const { data: integration, error } = await supabase
      .from('cms_connections')
      .insert([
        {
          project_id,
          platform,
          name,
          api_url,
          api_key,
          api_secret,
          site_id,
          webhook_url,
          config,
          status: 'active'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating integration:', error);
      return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
    }

    return NextResponse.json({ integration }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/integrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
