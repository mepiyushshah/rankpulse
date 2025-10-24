import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { articles } = await request.json();

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: 'Articles are required' },
        { status: 400 }
      );
    }

    // Insert articles into database
    const { data, error } = await supabase
      .from('articles')
      .insert(articles)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, articles: data });
  } catch (error: any) {
    console.error('Error creating articles:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create articles' },
      { status: 500 }
    );
  }
}
