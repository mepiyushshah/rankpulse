# 🤖 Automated Article Generation Setup

## Overview

The system automatically generates articles **1 day before** their scheduled publish date, allowing you to review them before they go live.

---

## 🎯 How It Works

1. **User adds keywords** → Scheduled on calendar (e.g., Jan 15, Jan 16, Jan 17)
2. **Cron runs every 30 minutes** → Checks for articles scheduled for TOMORROW
3. **Generates articles** → Creates content 1 day in advance
4. **Auto-publishes (optional)** → If enabled, publishes to WordPress immediately

---

## ⚙️ Setup Steps

### 1. Generate CRON_SECRET

```bash
# Generate a random secret
openssl rand -base64 32

# Or use any random string generator
```

### 2. Add to `.env.local`

```bash
CRON_SECRET=your_generated_secret_here
```

### 3. Deploy to Vercel

The `vercel.json` file is already configured to run the cron job every 30 minutes.

### 4. Add Environment Variable on Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `CRON_SECRET` = `your_generated_secret_here`
3. Save and redeploy

---

## 🧪 Manual Testing (Local)

You can manually trigger the cron job to test:

```bash
# Set your CRON_SECRET in .env.local first
curl -X GET "http://localhost:3000/api/cron/generate-articles" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📊 How to Enable Automation

1. Go to **Article Settings** page
2. Navigate to **"Automated Content Generation"** section
3. Toggle **"Enable Auto-Generation"** to ON
4. Set **"Publish Time"** (e.g., 09:00 AM)
5. Optionally enable **"Auto-Publish to WordPress"**
6. Click **"Save Settings"**

---

## 🔄 Cron Schedule

- **Frequency:** Every 30 minutes
- **Schedule:** `*/30 * * * *` (cron format)
- **When it runs:** 00:00, 00:30, 01:00, 01:30, ..., 23:30

---

## 📝 Example Workflow

**Today: January 14, 2025**

1. User adds keyword "best yoga studios" scheduled for **January 15, 2025**
2. **Cron runs on January 14** (today)
3. Finds articles scheduled for **January 15** (tomorrow)
4. Generates article for "best yoga studios"
5. Status changes: `scheduled` → `draft`
6. If auto-publish enabled: `draft` → `published` (sends to WordPress)

---

## ⚠️ Important Notes

### Error Handling
- **3 automatic retries** if generation fails
- Exponential backoff: 2s, 4s, 6s between retries
- Failure logged to `generation_logs` table (create this if needed)

### Requirements
- `auto_generate` must be enabled in Article Settings
- Articles must have `status = 'scheduled'`
- Articles must be scheduled for TOMORROW's date

### Limitations
- Only processes articles scheduled for the NEXT day
- Requires WordPress integration if auto-publish is enabled
- Cron runs every 30 minutes (not real-time)

---

## 🐛 Troubleshooting

### Cron not running?
1. Check Vercel Logs: Dashboard → Your Project → Logs → Filter "cron"
2. Verify `CRON_SECRET` is set correctly
3. Ensure `vercel.json` is in root directory

### Articles not generating?
1. Check `auto_generate` is enabled in settings
2. Verify articles are scheduled for TOMORROW
3. Check article status is `scheduled` (not `draft` or `published`)
4. Look for errors in Vercel Logs

### Manual test failed?
1. Verify `CRON_SECRET` matches in `.env.local` and request
2. Check server logs for detailed error messages
3. Ensure database connection is working

---

## 📊 Monitoring

Check cron job execution:
1. Vercel Dashboard → Logs
2. Filter by: `cron` or `/api/cron/generate-articles`
3. Look for:
   - `🤖 CRON JOB STARTED`
   - `✅ Article generated successfully`
   - `❌ FAILED after 3 attempts` (if errors occur)

---

## 🚀 Production Deployment

1. Push code to GitHub
2. Vercel will auto-deploy
3. Cron job will start running automatically
4. Check Vercel Logs to confirm it's working

---

## 🎉 That's It!

Your automated article generation system is now ready!

- Articles generate 1 day before scheduled date
- 3 automatic retries on failure
- Optional auto-publish to WordPress
- Runs every 30 minutes
