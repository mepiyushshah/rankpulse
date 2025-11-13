# 🚀 Complete Deployment Guide for RankPulse

## Step 1: Database Migration ✅

### Run the `used_images` table migration:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase-migration-used-images.sql`
6. Click **Run** button

**Verify it worked:**
```sql
SELECT * FROM used_images LIMIT 1;
```

You should see the table structure (even if no rows yet).

---

## Step 2: Git Commit & Push 📤

```bash
# Check what files changed
git status

# Add all files
git add .

# Commit with a message
git commit -m "Add automated article generation system with cron jobs"

# Push to GitHub (if not already connected, see Step 2a)
git push origin main
```

### Step 2a: If Git Remote Not Set Up

```bash
# Initialize git if needed
git init

# Add your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/rankpulse.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel 🔥

### Option A: If Already Connected to Vercel
1. Vercel will automatically detect the push and start deploying
2. Go to https://vercel.com/dashboard
3. Find your project and click on it
4. Wait for deployment to complete (usually 2-3 minutes)

### Option B: First Time Deployment
1. Go to https://vercel.com/dashboard
2. Click **Add New** > **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
5. Click **Deploy**

---

## Step 4: Add Environment Variables on Vercel 🔐

1. Go to Vercel Dashboard > Your Project > **Settings** > **Environment Variables**

2. Add the following variables:

| Name | Value |
|------|-------|
| `CRON_SECRET` | `hJ7VNykNg2ZubzBnNfzFsvRlDbcH+j/i5OvGydqD8oc=` |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` (your production URL) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jbcbrkrrbeerkgtbvvds.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (from .env.local) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (from .env.local) |
| `GROQ_API_KEY` | `gsk_F7TFM30QdQcOL3PiIjEWWGdyb3FY...` (from .env.local) |
| `SERPAPI_KEY` | `7cf2f81816091d0b1cd801c625149e7a...` (from .env.local) |
| `YOUTUBE_API_KEY` | `AIzaSyCKScD7DKUZrpwlWS_XZtzuIU...` (from .env.local) |
| `SCREENSHOTONE_API_KEY` | `JdNgwGbW7hINeg` (from .env.local) |

3. **Select Environment**: Production, Preview, Development (check all three)

4. Click **Save**

5. **Redeploy**: Go to **Deployments** tab > Click "..." on latest deployment > **Redeploy**

---

## Step 5: Verify Cron Job is Running 👀

### Check Vercel Logs:

1. Go to Vercel Dashboard > Your Project > **Logs**
2. Set time range to "Last hour"
3. Look for:
   ```
   🤖 ===== CRON JOB STARTED =====
   🕐 Time: [timestamp]
   ```

**Note**: Cron jobs run every 30 minutes. If you just deployed, you may need to wait up to 30 minutes to see the first execution.

### Manual Test (Optional):

You can manually trigger the cron job to test immediately:

```bash
curl -X GET "https://your-project.vercel.app/api/cron/generate-articles" \
  -H "Authorization: Bearer hJ7VNykNg2ZubzBnNfzFsvRlDbcH+j/i5OvGydqD8oc="
```

Replace `your-project.vercel.app` with your actual Vercel URL.

---

## Step 6: Enable Automation in UI ⚙️

1. Go to your deployed app
2. Navigate to **Article Settings** page
3. Scroll to **"Automated Content Generation"** section
4. Toggle **"Enable Auto-Generation"** to **ON**
5. Set **"Publish Time"** (e.g., `09:00 AM`)
6. Optionally enable **"Auto-Publish to WordPress"** (if WordPress is connected)
7. Click **"Save Settings"**

---

## Step 7: Test the Complete Workflow 🧪

### Test Scenario:

1. **Add a keyword to tomorrow's date:**
   - Go to Articles Planner
   - Click on tomorrow's date
   - Add keyword: "test automation article"
   - Save

2. **Wait for cron to run:**
   - Cron runs every 30 minutes
   - Check Vercel Logs after 30 minutes

3. **Verify article was generated:**
   - Go to Articles List
   - Look for your test article
   - Status should change from `scheduled` → `draft`
   - If auto-publish enabled: `draft` → `published`

---

## 🎉 You're All Set!

Your automated article generation system is now live and running!

### What Happens Now:

1. **Cron runs every 30 minutes**
2. **Finds articles scheduled for TOMORROW**
3. **Generates them automatically** (with 3 retries if needed)
4. **Optionally publishes to WordPress** (if enabled)

---

## 🐛 Troubleshooting

### Cron not running?

**Check 1**: Verify `CRON_SECRET` is set in Vercel
- Go to Settings > Environment Variables
- Look for `CRON_SECRET`

**Check 2**: Check Vercel Logs
- Dashboard > Logs
- Filter by "cron" or "generate-articles"

**Check 3**: Verify `vercel.json` exists in root
```bash
cat vercel.json
```

### Articles not generating?

**Check 1**: Auto-generation enabled?
- Go to Article Settings
- Verify toggle is ON

**Check 2**: Articles scheduled for tomorrow?
- Cron only processes articles scheduled for NEXT day
- Not today, not 2 days from now - only tomorrow

**Check 3**: Article status is 'scheduled'?
- Check in database or Articles List
- Status must be exactly `scheduled`

### Need Help?

1. Check `AUTOMATION_SETUP.md` for detailed troubleshooting
2. Check Vercel Logs for specific error messages
3. Test locally first using the manual curl command

---

## 📊 Monitoring

**Check cron execution regularly:**

1. Vercel Dashboard > Logs
2. Filter by: `cron` or `/api/cron/generate-articles`
3. Look for:
   - `🤖 CRON JOB STARTED`
   - `✅ Article generated successfully`
   - `📊 Summary:` (shows stats)

**Important Metrics:**
- Projects processed
- Articles processed
- Successfully generated
- Published to WordPress
- Failed (should be 0)

---

## 🔒 Security Notes

- Never commit `.env.local` to Git (it's already in `.gitignore`)
- `CRON_SECRET` should be kept secure and never shared
- Only Vercel cron jobs should call the endpoint (authentication required)

---

## ✅ Deployment Checklist

- [ ] Database migration run in Supabase
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] All environment variables added to Vercel
- [ ] Redeployed after adding env variables
- [ ] Cron job verified in Vercel Logs
- [ ] Auto-generation enabled in UI
- [ ] Test article scheduled for tomorrow
- [ ] Verified article generated successfully

---

**That's it! Your automation system is ready to generate articles on autopilot! 🚀**
