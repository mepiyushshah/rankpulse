import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('GET /api/projects - Unauthorized:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get existing project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    // If project exists, return it
    if (project) {
      return NextResponse.json({ project });
    }

    // If no project exists (PGRST116 error), create a default one
    if (fetchError?.code === 'PGRST116') {
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: 'My Project',
          description: 'Default project',
        })
        .select('id, name')
        .single();

      if (createError) {
        console.error('Error creating project:', createError);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
      }

      return NextResponse.json({ project: newProject });
    }

    // Some other error occurred
    console.error('Error fetching project:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });

  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
