import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { projectId, keywords } = await request.json();

    if (!projectId || !keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Project ID and keywords are required' },
        { status: 400 }
      );
    }

    // Prepare keyword records for insertion
    const keywordRecords = keywords.map((k: any) => ({
      project_id: projectId,
      keyword: k.keyword,
      priority: 'medium',
      status: 'active',
      // Store volume and difficulty in metadata (we can add these columns later if needed)
      metadata: JSON.stringify({
        volume: k.volume,
        difficulty: k.difficulty,
      }),
    }));

    // Check if metadata column exists, if not, insert without it
    const { data, error } = await supabase
      .from('keywords')
      .insert(
        keywordRecords.map((k: any) => ({
          project_id: k.project_id,
          keyword: k.keyword,
          priority: k.priority,
          status: k.status,
        }))
      )
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, keywords: data });
  } catch (error: any) {
    console.error('Error saving keywords:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save keywords' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ keywords: data });
  } catch (error: any) {
    console.error('Error fetching keywords:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
}
