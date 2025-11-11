import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the article we just created
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, featured_image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }

    // Also check the raw query to see all columns
    const { data: rawData, error: rawError } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      article,
      rawData,
      columns: Object.keys(rawData || {})
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
