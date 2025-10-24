import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Run migration SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add new columns to articles table
        ALTER TABLE articles
        ADD COLUMN IF NOT EXISTS keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS target_keyword TEXT,
        ADD COLUMN IF NOT EXISTS content_type TEXT,
        ADD COLUMN IF NOT EXISTS search_volume INT,
        ADD COLUMN IF NOT EXISTS keyword_difficulty INT;

        -- Add index for better query performance
        CREATE INDEX IF NOT EXISTS idx_articles_scheduled_at ON articles(scheduled_at);
        CREATE INDEX IF NOT EXISTS idx_articles_keyword_id ON articles(keyword_id);
      `
    });

    if (error) {
      // If rpc doesn't exist, try direct SQL execution
      console.log('Trying direct SQL execution...');

      const migrations = [
        `ALTER TABLE articles ADD COLUMN IF NOT EXISTS keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL`,
        `ALTER TABLE articles ADD COLUMN IF NOT EXISTS target_keyword TEXT`,
        `ALTER TABLE articles ADD COLUMN IF NOT EXISTS content_type TEXT`,
        `ALTER TABLE articles ADD COLUMN IF NOT EXISTS search_volume INT`,
        `ALTER TABLE articles ADD COLUMN IF NOT EXISTS keyword_difficulty INT`,
        `CREATE INDEX IF NOT EXISTS idx_articles_scheduled_at ON articles(scheduled_at)`,
        `CREATE INDEX IF NOT EXISTS idx_articles_keyword_id ON articles(keyword_id)`
      ];

      for (const sql of migrations) {
        const { error: sqlError } = await supabase.rpc('exec', { sql });
        if (sqlError) {
          console.error('Migration error:', sqlError);
          // Continue with other migrations
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed. Please verify columns were added in Supabase dashboard.'
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        error: error.message,
        note: 'Please run the SQL from supabase-migration-content-plan.sql manually in Supabase SQL Editor'
      },
      { status: 500 }
    );
  }
}
