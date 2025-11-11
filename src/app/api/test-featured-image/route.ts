import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get latest article
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, featured_image_url')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      article,
      hasFeaturedImage: !!article?.featured_image_url
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
