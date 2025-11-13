# ⚡ Quick Start Guide - 5 Minutes Setup

Follow these steps in order. The detailed guide is in `DEPLOYMENT_GUIDE.md`.

---

## 1️⃣ Database Migration (2 mins)

1. Open https://supabase.com/dashboard
2. Click your project
3. Go to **SQL Editor** → **New Query**
4. Copy-paste contents of `supabase-migration-used-images.sql`
5. Click **Run**

✅ Done!

---

## 2️⃣ Test Locally (Optional - 1 min)

```bash
# Make sure dev server is running
npm run dev

# In another terminal, run:
./test-cron-local.sh
```

You should see `✅ Success!` if everything works.

---

## 3️⃣ Deploy to Vercel (2 mins)

```bash
# Commit and push
git add .
git commit -m "Add automated article generation"
git push origin main
```

Vercel will auto-deploy (if connected).

**First time?** Go to https://vercel.com/new and import your GitHub repo.

---

## 4️⃣ Add Environment Variable (1 min)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Name**: `CRON_SECRET`
   - **Value**: `hJ7VNykNg2ZubzBnNfzFsvRlDbcH+j/i5OvGydqD8oc=`
   - **Environment**: Production, Preview, Development (all 3)
3. Click **Save**
4. Go to **Deployments** → Click **...** on latest → **Redeploy**

---

## 5️⃣ Enable Automation (1 min)

1. Open your app (production URL)
2. Go to **Article Settings**
3. Toggle **"Enable Auto-Generation"** → **ON**
4. Set **"Publish Time"** (e.g., 09:00 AM)
5. Click **"Save Settings"**

---

## 🎉 That's It!

**Test it:**
1. Go to Articles Planner
2. Add a keyword to **tomorrow's date**
3. Wait 30 minutes (or check Vercel Logs)
4. Article should be generated automatically!

---

## 📚 Need More Info?

- **Detailed Setup**: See `DEPLOYMENT_GUIDE.md`
- **How It Works**: See `AUTOMATION_SETUP.md`
- **Troubleshooting**: Check Vercel Logs → Filter by "cron"

---

## 🐛 Quick Troubleshooting

**Cron not running?**
→ Check `CRON_SECRET` is in Vercel environment variables

**Articles not generating?**
→ Make sure articles are scheduled for **tomorrow** (not today!)

**Need help?**
→ Check Vercel Logs for error messages
