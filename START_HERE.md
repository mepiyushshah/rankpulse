# 🚀 START HERE - RankPulse Automation Setup

## 📚 Documentation Guide

You have multiple setup documents. Here's what each one does:

---

## For You Right Now: 👇

### 1. **QUICK_START.md** ⚡ (START HERE!)
**Read this first!** 5-minute quick setup guide.
- Database migration
- Local testing
- Deploy to Vercel
- Add environment variables
- Enable automation

### 2. **SETUP_SUMMARY.md** 📋
Complete summary of everything that's been done:
- All features implemented
- Files changed
- Your to-do checklist
- Key information (secrets, API keys)

### 3. **DEPLOYMENT_GUIDE.md** 📖
Detailed step-by-step deployment instructions:
- Full walkthrough with screenshots references
- Troubleshooting section
- Monitoring tips
- Security notes

### 4. **AUTOMATION_SETUP.md** 🤖
How the automation system works:
- Technical details
- Workflow explanation
- Configuration options
- Error handling

---

## 🎯 Quick Action Items

### Right Now:
1. Read `QUICK_START.md`
2. Run database migration in Supabase
3. Test locally with `./test-cron-local.sh` (optional)
4. Deploy to Vercel
5. Add `CRON_SECRET` to Vercel
6. Enable automation in UI

### Your CRON_SECRET:
```
hJ7VNykNg2ZubzBnNfzFsvRlDbcH+j/i5OvGydqD8oc=
```

---

## 🛠️ Helper Scripts

### `test-cron-local.sh`
Test the cron job on your local machine before deploying.
```bash
./test-cron-local.sh
```

### `run-migration.sh`
Helper to display the database migration SQL.
```bash
./run-migration.sh
```

---

## 🎉 What's New

### ✅ Features Implemented:
1. **Pixabay Image Integration**
   - 16:9 landscape images only
   - No duplicates
   - Relevance filtering
   - 2-4 images per article

2. **Blog Title Capitalization**
   - All H1 titles now Capitalized Case

3. **Automated Article Generation**
   - Generates 1 day before scheduled date
   - 3 automatic retries
   - Runs every 30 minutes
   - Optional auto-publish to WordPress

4. **Simplified Settings UI**
   - Removed unnecessary options
   - Kept only Publish Time

---

## 📞 Need Help?

**Deployment issues?**
→ Check `DEPLOYMENT_GUIDE.md`

**How does automation work?**
→ Check `AUTOMATION_SETUP.md`

**Quick reference?**
→ Check `SETUP_SUMMARY.md`

**Errors in Vercel?**
→ Check Vercel Logs → Filter by "cron"

---

## ⏱️ Time Estimate

- **Database Migration**: 2 minutes
- **Local Testing**: 1 minute (optional)
- **Deployment**: 2 minutes
- **Environment Variables**: 1 minute
- **Enable Automation**: 1 minute

**Total**: ~7 minutes (5 minutes if you skip testing)

---

## 🎯 Success Criteria

After setup, you should see:
- ✅ `used_images` table in Supabase
- ✅ Project deployed on Vercel
- ✅ CRON_SECRET in Vercel environment variables
- ✅ Cron job running in Vercel Logs (every 30 mins)
- ✅ Auto-generation enabled in Article Settings

**Test it:**
1. Add keyword to tomorrow's date
2. Wait 30 minutes
3. Article should be generated automatically!

---

## 🚀 Let's Go!

**Start with:** `QUICK_START.md`

Then come back here if you need more details from the other guides.

Good luck! 🎉
