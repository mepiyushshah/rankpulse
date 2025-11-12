# Sitemap Integration & Internal Linking Feature

## Overview

This feature allows users to add their website's sitemap URL to automatically discover existing articles/pages for intelligent internal linking. When generating new content, the AI will now suggest links to both:
- **Generated articles** (from the RankPulse platform)
- **Existing website articles** (discovered from sitemap)

This dramatically improves SEO by creating a strong internal linking structure between new and existing content.

---

## Database Schema

### Tables Added

#### 1. `project_sitemaps`
Stores sitemap URLs for each project.

```sql
CREATE TABLE project_sitemaps (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  sitemap_url TEXT NOT NULL,
  last_parsed_at TIMESTAMP,
  article_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, parsing, active, error
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, sitemap_url)
);
```

#### 2. `sitemap_articles`
Stores parsed articles/pages from sitemaps.

```sql
CREATE TABLE sitemap_articles (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  sitemap_id UUID REFERENCES project_sitemaps(id),
  url TEXT NOT NULL,
  title TEXT,
  last_modified TIMESTAMP,
  change_frequency TEXT,
  priority DECIMAL(2,1),
  discovered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, url)
);
```

### Migration File
Run this migration: `/supabase-migration-sitemaps.sql`

---

## API Endpoints

### 1. Sitemap Management (`/api/sitemaps`)

#### GET - Fetch all sitemaps
```
GET /api/sitemaps?projectId={projectId}

Response:
{
  "sitemaps": [
    {
      "id": "uuid",
      "sitemap_url": "https://example.com/sitemap.xml",
      "last_parsed_at": "2025-01-12T10:00:00Z",
      "article_count": 150,
      "status": "active",
      "error_message": null
    }
  ]
}
```

#### POST - Add and parse a sitemap
```
POST /api/sitemaps
Content-Type: application/json

{
  "projectId": "uuid",
  "sitemapUrl": "https://example.com/sitemap.xml"
}

Response:
{
  "message": "Sitemap added successfully and parsing started",
  "sitemap": { ... }
}
```

**Background Processing:**
- Sitemap is parsed asynchronously
- Status updates from `parsing` → `active` or `error`
- Articles are extracted and stored in `sitemap_articles`

#### DELETE - Remove a sitemap
```
DELETE /api/sitemaps?id={sitemapId}

Response:
{
  "message": "Sitemap deleted successfully"
}
```

### 2. Sitemap Articles (`/api/sitemaps/articles`)

#### GET - Fetch discovered articles
```
GET /api/sitemaps/articles?projectId={projectId}&limit=50&search=keyword

Response:
{
  "articles": [
    {
      "id": "uuid",
      "url": "https://example.com/blog/article",
      "title": "Article Title",
      "last_modified": "2025-01-10T00:00:00Z",
      "priority": 0.8
    }
  ]
}
```

### 3. Enhanced Internal Links API (`/api/internal-links`)

Now includes sitemap articles in suggestions!

```
POST /api/internal-links
Content-Type: application/json

{
  "projectId": "uuid",
  "content": "Article content...",
  "keyword": "optional keyword"
}

Response:
{
  "success": true,
  "suggestions": [
    {
      "articleId": "uuid",
      "articleTitle": "Related Article",
      "anchorText": "check this guide",
      "contextLocation": "In the second paragraph...",
      "relevanceScore": 92,
      "url": "https://example.com/blog/related" // For sitemap articles
    }
  ],
  "totalArticles": 200,
  "generatedArticles": 50,
  "sitemapArticles": 150
}
```

**AI Logic:**
- Prefers linking to existing website articles (better SEO)
- Returns full URL for sitemap articles
- Returns `null` URL for generated articles (use internal routing)
- Sorts by relevance score

---

## User Interface

### Settings Page
Location: `/dashboard/articles/settings` → **"Sitemap & Links"** tab

**Features:**
1. ✅ Add sitemap URL input
2. ✅ View all connected sitemaps
3. ✅ Real-time parsing status (pending, parsing, active, error)
4. ✅ Article count per sitemap
5. ✅ View discovered articles (up to 50 shown)
6. ✅ Delete sitemaps
7. ✅ Error messages if parsing fails

**Component:** `/src/components/settings/SitemapSettings.tsx`

---

## How It Works

### 1. User Adds Sitemap
```
User → Settings → Sitemap & Links Tab → Enter URL → Add Sitemap
```

### 2. Background Parsing
```
API receives URL
  ↓
Creates record (status: parsing)
  ↓
Fetches sitemap XML
  ↓
Extracts <url> blocks
  ↓
Parses: loc, lastmod, changefreq, priority
  ↓
Stores in sitemap_articles
  ↓
Updates status: active (or error)
```

**Parsing Logic:**
- Uses regex to parse XML (no external libraries needed)
- Extracts title from URL slug as fallback
- Handles duplicates via UPSERT
- Batch inserts for performance

### 3. Article Generation with Internal Links
```
User generates new article
  ↓
/api/generate-article called
  ↓
Calls /api/internal-links
  ↓
AI analyzes content
  ↓
Searches both:
  - Generated articles (from database)
  - Sitemap articles (from sitemap)
  ↓
Returns 3-7 relevant links (configurable)
  ↓
Links inserted into article content
```

**AI Prompt Strategy:**
- Provides both sources to AI
- Explicitly prefers existing site articles for SEO
- Includes full URLs for sitemap articles
- Maintains natural anchor text

---

## Configuration

### Article Settings Integration
The existing internal linking settings apply:

- **Enable/Disable:** `auto_internal_links`
- **Min Links:** `min_internal_links` (default: 3)
- **Max Links:** `max_internal_links` (default: 7)

Location: `/dashboard/articles/settings` → **"SEO & Optimization"** tab

---

## Example Use Case

**Scenario:** You have a skincare blog with 100 existing articles and want to generate new content with proper internal linking.

**Steps:**

1. **Add Sitemap:**
   ```
   Go to Settings → Sitemap & Links
   Enter: https://yourskincareblog.com/sitemap.xml
   Click "Add Sitemap"
   ```

2. **Wait for Parsing:**
   ```
   Status: Parsing... (takes 5-30 seconds)
   ↓
   Status: Active
   Articles: 100 discovered
   ```

3. **Generate New Article:**
   ```
   Go to Planner
   Select keyword: "Best Retinol Serums 2025"
   Generate content
   ```

4. **AI Automatically Links:**
   ```
   New article includes:
   - Link to "How to Use Retinol" (existing site)
   - Link to "Anti-Aging Skincare Guide" (existing site)
   - Link to "Vitamin C vs Retinol" (generated)
   ```

**Result:** Strong internal linking structure that boosts SEO and user engagement!

---

## Technical Details

### File Structure
```
/src
  /app
    /api
      /sitemaps
        route.ts                    # Sitemap CRUD
        /articles
          route.ts                  # Get sitemap articles
      /internal-links
        route.ts                    # Enhanced with sitemap support
  /components
    /settings
      SitemapSettings.tsx           # UI component
  /app/dashboard/articles/settings
    page.tsx                        # Main settings page (updated)

/supabase-migration-sitemaps.sql    # Database migration
/SITEMAP_FEATURE.md                 # This file
```

### Dependencies
No new dependencies required! Uses:
- Built-in `fetch()` for sitemap retrieval
- Regex for XML parsing
- Existing Groq AI integration
- Existing Supabase setup

### Performance Considerations
- **Parsing:** Async background processing (non-blocking)
- **Storage:** Up to 100 sitemap articles loaded per query
- **AI Context:** Limited to top 50 generated + 100 sitemap articles
- **Caching:** Sitemap articles cached in database until re-parsed

---

## Testing Checklist

- [x] Database migration runs successfully
- [x] Can add sitemap URL
- [x] Sitemap parses correctly (handles various XML formats)
- [x] Articles stored in database
- [x] Can view discovered articles in UI
- [x] Internal links API includes sitemap articles
- [x] New articles have both internal and external site links
- [x] Can delete sitemaps
- [x] Error handling for invalid URLs
- [x] Error handling for parsing failures

---

## Future Enhancements

### Possible Improvements:
1. **Sitemap Index Support:** Handle sitemap index files that reference multiple sitemaps
2. **Auto Re-parsing:** Periodic background job to refresh sitemap data
3. **Title Extraction:** Fetch actual page titles via meta tags (optional)
4. **Link Preview:** Show which articles will likely be linked before generation
5. **Manual URL Addition:** Allow users to manually add URLs
6. **Link Analytics:** Track which internal links get clicked most

---

## Troubleshooting

### Common Issues

**1. Sitemap won't parse**
- Verify URL is accessible (not behind auth)
- Check XML format is valid
- Ensure sitemap follows XML sitemap protocol

**2. No articles discovered**
- Check if sitemap has `<url>` tags
- Verify sitemap is not empty
- Check for XML parsing errors in logs

**3. Internal links not appearing**
- Ensure `auto_internal_links` is enabled in settings
- Check if sitemap articles exist in database
- Verify article content has enough context for linking

---

## API Response Examples

### Successful Sitemap Parse
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "sitemap_url": "https://example.com/sitemap.xml",
  "status": "active",
  "article_count": 142,
  "last_parsed_at": "2025-01-12T10:30:00Z",
  "error_message": null
}
```

### Failed Sitemap Parse
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "sitemap_url": "https://example.com/invalid.xml",
  "status": "error",
  "article_count": 0,
  "last_parsed_at": null,
  "error_message": "Failed to fetch sitemap: 404 Not Found"
}
```

---

## Summary

This feature bridges the gap between new AI-generated content and existing website content, creating a cohesive internal linking strategy that:

✅ Improves SEO rankings
✅ Increases user engagement
✅ Reduces bounce rates
✅ Creates content authority
✅ Automates tedious manual linking

**Result:** Better organic traffic and improved site structure!
