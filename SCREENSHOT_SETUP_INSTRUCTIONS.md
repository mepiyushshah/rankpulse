# Screenshot Integration Setup Instructions

## ✅ What's Been Implemented

Your RankPulse project now has **automatic screenshot integration** for listicle articles! When generating articles about "Best Tools", "Top Software", etc., the system will automatically:

1. Detect that it's a listicle article
2. Extract tool names from the generated content
3. Find the official website for each tool
4. Capture hero section screenshots
5. Insert screenshots after tool descriptions
6. Cache screenshots for 30 days to save API costs

---

## 🔧 Setup Steps (REQUIRED)

### Step 1: Create Supabase Storage Bucket

Run this SQL in your Supabase SQL Editor:
https://supabase.com/dashboard/project/jbcbrkrrbeerkgtbvvds/sql/new

```sql
-- Copy and paste from: setup-storage-bucket.sql
```

This creates the `article-images` bucket for storing screenshots.

---

### Step 2: Create Screenshot Cache Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste from: setup-screenshot-cache-table.sql
```

This creates the caching table to store screenshot URLs for 30 days.

---

### Step 3: (Optional) Set Up Google Custom Search API

For automatic URL detection, you need a Google Custom Search API key:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create a new API key
3. Enable "Custom Search API"
4. Go to: https://programmablesearchengine.google.com/
5. Create a new search engine (search the entire web)
6. Copy your Search Engine ID

Then update `.env.local`:
```bash
GOOGLE_SEARCH_API_KEY=your_actual_key_here
GOOGLE_SEARCH_ENGINE_ID=your_actual_id_here
```

**Without Google API:** The system will fallback to common URL patterns (toolname.com, toolname.io, etc.)

---

## 📋 What's Already Done

✅ ScreenshotOne API key added to `.env.local`
✅ Screenshot service created (`src/lib/screenshot-service.ts`)
✅ Listicle detection logic added
✅ Automatic screenshot insertion in generate-article API
✅ 30-day caching to reduce API costs
✅ Fallback logic (skip image if fails)

---

## 🎯 How It Works

### When You Generate an Article:

1. **Keyword Detection**: System checks if keyword matches listicle patterns:
   - "Best [something]"
   - "Top [something]"
   - Contains: tools, software, platforms, apps, services
   - Contains: vs, comparison, alternatives, review

2. **Content Generation**: AI generates listicle with numbered format:
   ```markdown
   ## 1. Tool Name - Description

   [Description paragraphs...]

   **Key Features:**
   - Feature 1
   - Feature 2
   ```

3. **Screenshot Processing** (automatic):
   - Extracts tool names from `## 1. Tool Name` headings
   - Searches for official website URL
   - Checks cache (30-day)
   - If not cached: Captures screenshot via ScreenshotOne
   - Uploads to Supabase Storage
   - Inserts after description paragraph

4. **Final Output**:
   ```markdown
   ## 1. Tool Name - Description

   [Description paragraphs...]

   ![Tool Name Screenshot](https://your-supabase-url/screenshots/toolname.jpg)

   **Key Features:**
   - Feature 1
   ```

---

## 💰 Cost Breakdown

### ScreenshotOne API:
- **Free Tier**: 100 screenshots/month
- **Your Current Plan**: Check at https://screenshotone.com/dashboard
- **With 30-day cache**: If you generate 50 articles/month with 7 tools each = ~350 screenshots
  - First month: 350 API calls
  - Second month: ~50 API calls (cache hits)

### Google Custom Search (Optional):
- **Free**: 100 searches/day
- Cost: $0/month for typical usage

### Supabase Storage:
- **Free**: 1GB storage
- Cost: $0/month for screenshots

---

## 🧪 Testing

### Test the Screenshot Feature:

1. Go to your dashboard: http://localhost:3000/dashboard/planner
2. Create a new keyword: "Best Project Management Tools"
3. Generate article
4. Check server logs for:
   ```
   === DETECTED LISTICLE - ADDING SCREENSHOTS ===
   Found 7 tools to screenshot
   Processing screenshot for: Asana
   ✅ Added screenshot for Asana
   ```

### Troubleshooting:

**If screenshots don't appear:**
- Check server logs for error messages
- Verify Supabase bucket was created: Go to Storage section in Supabase dashboard
- Verify `.env.local` has `SCREENSHOTONE_API_KEY`
- Check ScreenshotOne dashboard for API usage/errors

**If URLs not found:**
- Set up Google Custom Search API (optional but recommended)
- Or system will use fallback pattern matching

---

## 📝 Files Created/Modified

### New Files:
- `src/lib/screenshot-service.ts` - Screenshot capture and caching logic
- `setup-storage-bucket.sql` - Supabase bucket creation script
- `setup-screenshot-cache-table.sql` - Cache table creation script

### Modified Files:
- `.env.local` - Added ScreenshotOne API key
- `src/app/api/generate-article/route.ts` - Integrated screenshot processing

---

## 🎉 You're Ready!

Once you run the SQL scripts in Supabase, the screenshot feature will be **fully functional**.

Try generating a listicle article and watch the magic happen! 🚀

---

## Questions?

- ScreenshotOne API: https://screenshotone.com/docs
- Supabase Storage: https://supabase.com/docs/guides/storage
- Google Custom Search: https://developers.google.com/custom-search
