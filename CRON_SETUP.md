# Auto-Publish Cron Setup Guide

This guide explains how to set up automatic publishing for scheduled articles in RankPulse.

## Overview

RankPulse has an auto-publish system that automatically publishes scheduled articles to WordPress when their scheduled time arrives.

## How It Works

1. **User schedules an article** via Content Planner with a specific date/time
2. **Article is stored** in database with `status='scheduled'` and `scheduled_at` timestamp
3. **Cron job runs hourly** (or more frequently) and checks for articles ready to publish
4. **Articles are published** to WordPress automatically when `scheduled_at` time is reached
5. **Status is updated** to `published` in the database

## API Endpoint

**URL:** `https://your-domain.com/api/cron/auto-publish`

**Method:** `POST` or `GET`

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
Content-Type: application/json
```

**Environment Variable Required:**
- `CRON_SECRET` - Set in `.env.local`

## Setup Options

### Option 1: Vercel Cron (Recommended for Vercel Deployments)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-publish",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)

**For more frequent checks (every 15 minutes):**
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-publish",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Option 2: GitHub Actions

Create `.github/workflows/auto-publish.yml`:

```yaml
name: Auto-Publish Scheduled Articles

on:
  schedule:
    # Runs every hour
    - cron: '0 * * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  auto-publish:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Auto-Publish
        run: |
          curl -X POST https://your-domain.com/api/cron/auto-publish \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

**Setup:**
1. Go to GitHub repository → Settings → Secrets
2. Add `CRON_SECRET` with your cron secret value
3. Commit the workflow file
4. GitHub will run it automatically every hour

### Option 3: External Cron Services

Use services like:
- **EasyCron** (https://www.easycron.com)
- **cron-job.org** (https://cron-job.org)
- **Pipedream** (https://pipedream.com)

**Setup Steps:**
1. Sign up for the service
2. Create a new cron job
3. Set URL: `https://your-domain.com/api/cron/auto-publish`
4. Set Method: `POST`
5. Add Header: `Authorization: Bearer YOUR_CRON_SECRET`
6. Set Schedule: Every hour (or every 15 minutes for more precision)

### Option 4: Server Cron (Linux/Unix)

If you have server access, add to crontab:

```bash
# Run every hour
0 * * * * curl -X POST https://your-domain.com/api/cron/auto-publish -H "Authorization: Bearer YOUR_CRON_SECRET"

# Or every 15 minutes
*/15 * * * * curl -X POST https://your-domain.com/api/cron/auto-publish -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Testing

### Manual Test (Local Development)

```bash
curl -X POST http://localhost:3000/api/cron/auto-publish \
  -H "Authorization: Bearer rankpulse_cron_secret_2025_secure_key_789xyz" \
  -H "Content-Type: application/json"
```

### Manual Test (Production)

```bash
curl -X POST https://your-domain.com/api/cron/auto-publish \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Expected Response (No articles to publish):**
```json
{
  "success": true,
  "message": "No articles to publish",
  "published": 0,
  "results": []
}
```

**Expected Response (Articles published):**
```json
{
  "success": true,
  "message": "Published 2 of 2 scheduled articles",
  "published": 2,
  "failed": 0,
  "results": [
    {
      "articleId": "abc-123",
      "title": "My Article Title",
      "status": "success",
      "wordpressPostId": 456,
      "publishedUrl": "https://yoursite.com/my-article-title"
    }
  ]
}
```

## Schedule Precision

The cron job checks for articles where `scheduled_at <= current_time`:

- **Hourly cron (0 * * * *)**: Articles will be published within 1 hour of scheduled time
- **Every 15 minutes (*/15 * * * *)**: Articles will be published within 15 minutes of scheduled time
- **Every 5 minutes (*/5 * * * *)**: Articles will be published within 5 minutes of scheduled time

**Recommendation:** Use every 15 minutes for good precision without excessive API calls.

## What Happens When Publishing Fails?

1. **No WordPress integration:** Article status is changed to `draft` (manual intervention required)
2. **WordPress API error:** Article remains as `scheduled` and will retry on next cron run
3. **Other errors:** Article remains as `scheduled` and will retry on next cron run

## Monitoring

Check the cron job logs to see what happened:

### Vercel Deployment
- Go to Vercel Dashboard → Your Project → Deployments → Logs
- Filter by "cron"

### GitHub Actions
- Go to GitHub → Actions tab
- Click on the latest "Auto-Publish Scheduled Articles" workflow run

### Server/External Service
- Check the service's dashboard/logs

## Security

The endpoint is protected by:
- **Authorization header** with cron secret
- Only accepts requests with valid `Bearer` token
- Returns 401 Unauthorized for invalid tokens

Make sure to:
1. Keep `CRON_SECRET` secure
2. Never commit it to version control
3. Use different secrets for development and production

## Troubleshooting

### Articles not publishing?

1. **Check if cron is running:**
   - Verify cron job is scheduled and active
   - Check cron job logs for errors

2. **Check article status in database:**
   - Verify `status='scheduled'`
   - Verify `scheduled_at` is in the past
   - Check if WordPress integration is active

3. **Test manually:**
   ```bash
   curl -X POST https://your-domain.com/api/cron/auto-publish \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

4. **Check WordPress integration:**
   - Go to Dashboard → Integrations
   - Verify WordPress is connected and status is "Active"
   - Test connection

### Authorization errors?

- Verify `CRON_SECRET` environment variable is set correctly
- Check the Authorization header format: `Bearer YOUR_SECRET`

## Additional Notes

- The cron job processes ALL scheduled articles that are ready to publish in one run
- Articles are processed sequentially (one at a time)
- Each published article gets updated with WordPress post ID and published URL
- Failed articles can be retried manually from Content History page
