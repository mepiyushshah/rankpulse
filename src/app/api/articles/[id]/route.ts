import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const updates = await request.json();

    // Update article in database
    const { error } = await supabase
      .from('articles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating article:', error);
      throw new Error('Failed to update article');
    }

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update article' },
      { status: 500 }
    );
  }
}
