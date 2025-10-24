import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!projectId || !month || !year) {
      return NextResponse.json(
        { error: 'Project ID, month, and year are required' },
        { status: 400 }
      );
    }

    // Calculate date range for the month
    const startDate = new Date(parseInt(year), parseInt(month), 1);
    const endDate = new Date(parseInt(year), parseInt(month) + 1, 0);

    // Delete all articles in this month for this project
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('project_id', projectId)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString());

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting articles:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete articles' },
      { status: 500 }
    );
  }
}
