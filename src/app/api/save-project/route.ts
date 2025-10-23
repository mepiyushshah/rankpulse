import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, website_url, country, language, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    // Create Supabase server client with user's session
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Not authenticated. Please log in first.' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', user.id);

    // Insert project with authenticated user's ID
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        website_url,
        country: country || 'US',
        language: language || 'en',
        description,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: data,
    });
  } catch (error: any) {
    console.error('Error saving project:', error);
    return NextResponse.json(
      { error: 'Failed to save project', details: error.message },
      { status: 500 }
    );
  }
}
