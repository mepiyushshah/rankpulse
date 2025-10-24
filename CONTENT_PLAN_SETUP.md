# Content Plan Feature Setup Guide

## 🚀 Quick Setup (Required Before Using)

The "Generate with AI" feature needs additional database columns. Follow these steps:

### Step 1: Run Database Migration

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project: **RankPulse** (jbcbrkrrbeerkgtbvvds)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL from `supabase-migration-content-plan.sql`
6. Click **Run** or press `Cmd+Enter`

### Step 2: Verify Migration

After running the migration, verify the columns were added:
1. Go to **Table Editor** > **articles**
2. Check if these new columns exist:
   - `keyword_id` (uuid)
   - `target_keyword` (text)
   - `content_type` (text)
   - `search_volume` (int4)
   - `keyword_difficulty` (int4)

---

## 📋 How to Use the Feature

### Prerequisites
Before generating a content plan, make sure you have:
1. ✅ **Business Description** - Set in Settings > Business Details
2. ✅ **Target Audiences** - Set in Settings > Audience & Competitors
3. ✅ **Keywords** - Add keywords using "Add Manually" button

### Generate Content Plan

1. Navigate to **Content Planner** page
2. Click **"Generate with AI"** button
3. Configure your preferences:
   - **Articles Per Week**: How many articles to schedule weekly
   - **Start Week**: Which week of the month to begin
   - **Content Mix**: Type of content to prioritize
4. Click **"Generate Content Plan"**
5. Wait for AI to analyze your data and create the plan
6. Articles will appear on the calendar automatically!

---

## 🎨 Features

### What the AI Does:
- ✅ Analyzes your business, audiences, and competitors
- ✅ Selects keywords from your saved list
- ✅ Creates SEO-optimized article titles
- ✅ Assigns content types (How-to, Listicle, Tutorial, etc.)
- ✅ Distributes articles strategically across the month
- ✅ Balances keyword difficulty (easy + challenging)
- ✅ Estimates search volume and difficulty

### Calendar Features:
- 📅 View scheduled articles by date
- 🎨 Color-coded by difficulty (green=easy, yellow=medium, red=hard)
- 📊 See volume and difficulty at a glance
- 📝 Content type icons for quick identification

---

## 🔧 Troubleshooting

### "No keywords found" Error
**Solution**: Add keywords first using the "Add Manually" button with either:
- **Find Keywords** tab (AI-powered keyword research)
- **Import Keywords List** tab (Manual comma-separated list)

### "Migration Error" or Missing Columns
**Solution**: Manually run the SQL migration:
1. Open `supabase-migration-content-plan.sql`
2. Copy all SQL content
3. Run it in Supabase SQL Editor

### Articles Not Showing on Calendar
**Solution**:
1. Check if articles were created in Supabase > Table Editor > articles
2. Verify `scheduled_at` dates are in the current month
3. Refresh the page
4. Try changing months and coming back

---

## 📝 Database Schema Changes

The migration adds these columns to the `articles` table:

```sql
-- Keyword tracking
keyword_id UUID          -- Links to keywords table
target_keyword TEXT      -- The actual keyword text

-- Content planning
content_type TEXT        -- Type: "How-to Guide", "Listicle", etc.
search_volume INT        -- Monthly searches
keyword_difficulty INT   -- SEO difficulty (0-100)
```

All fields are optional and won't affect existing articles.

---

## 🎯 Next Steps

After setup, you can:
1. Generate multiple content plans for different months
2. Edit article titles directly in the calendar (coming soon)
3. Click articles to view/edit full content (coming soon)
4. Regenerate individual days (coming soon)

---

## 💡 Tips

- Start with 2 articles per week if you're new
- Mix content types for better SEO diversity
- Target easier keywords (difficulty < 30) first
- Use business description to guide AI's tone
- Add competitor analysis for better keyword selection

Enjoy your AI-powered content calendar! 🎉
