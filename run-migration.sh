#!/bin/bash

echo "🗄️  Running Database Migration for 'used_images' table..."
echo ""

# Read the migration file
MIGRATION_SQL=$(cat supabase-migration-used-images.sql)

# Execute the migration using psql
# You'll need to get your database connection string from Supabase Dashboard
# Settings > Database > Connection String (Direct Connection)

echo "📋 Copy the SQL below and run it in your Supabase SQL Editor:"
echo "   (Go to: Supabase Dashboard > SQL Editor > New Query)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat supabase-migration-used-images.sql
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ After running the SQL, press Enter to continue..."
read

echo ""
echo "✅ Migration complete!"
