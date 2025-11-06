import { createClient } from '@/lib/supabase-server';
import { createWordPressClient } from '@/lib/wordpress-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the integration (RLS policies will ensure it belongs to user's project)
    const { data: integration, error: fetchError } = await supabase
      .from('cms_connections')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !integration) {
      console.error('Error fetching integration:', fetchError);
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Only support WordPress for now
    if (integration.platform !== 'wordpress') {
      return NextResponse.json({
        error: 'Only WordPress integrations are supported for testing'
      }, { status: 400 });
    }

    // Validate required fields
    if (!integration.api_url || !integration.api_key || !integration.api_secret) {
      return NextResponse.json({
        error: 'Missing required WordPress credentials (URL, username, or application password)'
      }, { status: 400 });
    }

    // Create WordPress client and test connection
    const wpClient = createWordPressClient(integration);
    const result = await wpClient.testConnection();

    if (!result.success) {
      console.error('WordPress connection test failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error || 'Connection test failed'
      }, { status: 400 });
    }

    // Update last_tested_at timestamp
    const { error: updateError } = await supabase
      .from('cms_connections')
      .update({
        last_tested_at: new Date().toISOString(),
        status: 'active'
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating integration status:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error in POST /api/integrations/[id]/test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
