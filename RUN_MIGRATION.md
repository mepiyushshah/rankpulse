# 🚀 Quick Migration Guide

## You MUST run this migration before using "Generate with AI"

The error you saw is because the new database columns don't exist yet. Follow these simple steps:

---

## Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard/project/jbcbrkrrbeerkgtbvvds**
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

---

## Step 2: Copy & Paste This SQL

```sql
-- Add new columns to articles table
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS keyword_id UUID REFERENCES keywords(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS target_keyword TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT,
ADD COLUMN IF NOT EXISTS search_volume INT,
ADD COLUMN IF NOT EXISTS keyword_difficulty INT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_scheduled_at ON articles(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_articles_keyword_id ON articles(keyword_id);
```

---

## Step 3: Run It

Click **"Run"** button or press **Cmd+Enter** (Mac) / **Ctrl+Enter** (Windows)

You should see: ✅ **Success. No rows returned**

---

## Step 4: Test It

1. Refresh your browser at http://localhost:3000/dashboard/planner
2. Click **"Generate with AI"** button
3. The modal should open without errors!

---

## ✅ That's it!

The error is now fixed and you can use the AI content generation feature.

---

## Need Help?

If you get any errors during migration:
- Make sure you're logged into the correct Supabase project
- Check that the `articles` table exists
- Try running each `ALTER TABLE` statement one at a time

The migration is safe - it uses `IF NOT EXISTS` so it won't break if columns already exist.
