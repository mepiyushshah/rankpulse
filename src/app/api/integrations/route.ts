import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('GET /api/integrations - Auth check:', {
      user: user?.id,
      authError: authError?.message
    });

    if (authError || !user) {
      console.error('GET /api/integrations - Unauthorized:', authError);
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

    console.log('POST /api/integrations - Auth check:', {
      user: user?.id,
      authError: authError?.message
    });

    if (authError || !user) {
      console.error('POST /api/integrations - Unauthorized:', authError);
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

    // Prepare the insert data, only including fields that exist in the table
    const insertData: any = {
      project_id,
      platform,
      status: 'active'
    };

    // Add optional fields only if they're provided
    if (api_url) insertData.api_url = api_url;
    if (api_key) insertData.api_key = api_key;
    if (api_secret) insertData.api_secret = api_secret;
    if (site_id) insertData.site_id = site_id;
    if (webhook_url) insertData.webhook_url = webhook_url;
    if (config) insertData.config = config;

    // Create the integration
    const { data: integration, error } = await supabase
      .from('cms_connections')
      .insert([insertData])
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
