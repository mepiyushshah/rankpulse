# RankPulse Setup Guide

This guide will walk you through setting up RankPulse from scratch with 100% free services.

## ⏱️ Estimated Time: 15-20 minutes

---

## Step 1: Supabase Setup (5 minutes)

### Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" (free, no credit card required)
3. Sign up with GitHub or email
4. Create a new project:
   - **Name**: rankpulse
   - **Database Password**: (Choose a strong password - save it!)
   - **Region**: (Choose closest to you)
   - Click "Create new project"
5. Wait 2-3 minutes for project to provision

### Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste it into the SQL Editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned" - this is correct!

### Get API Credentials

1. Go to **Project Settings** (gear icon, bottom left)
2. Click **API** in the sidebar
3. Copy these values (you'll need them next):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon public` key)
   - **service_role key** (click to reveal, then copy)

---

## Step 2: Groq API Setup (3 minutes)

### Get Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card)
3. Click "API Keys" in left sidebar
4. Click "Create API Key"
5. Give it a name (e.g., "RankPulse")
6. Copy the API key immediately (you can't see it again!)

**Groq Free Tier:**
- Very generous limits
- Fast inference
- No credit card required

---

## Step 3: Configure Environment Variables (2 minutes)

1. In your project folder, copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` in your code editor

3. Paste your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Save the file

**Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

---

## Step 4: Install Dependencies & Run (3 minutes)

### Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 19
- TailwindCSS
- Supabase client
- Groq SDK
- UI components
- And more...

### Start Development Server

```bash
npm run dev
```

You should see:
```
✓ Ready in 1-2 seconds
- Local: http://localhost:3000
```

### Open in Browser

1. Go to `http://localhost:3000`
2. You should see the RankPulse landing page!

---

## Step 5: Test the Application (5 minutes)

### Create Your Account

1. Click "Get Started Free"
2. Fill out the signup form:
   - Full Name
   - Email
   - Password (min 6 characters)
3. Click "Create Account"

### Check Database

1. Go back to Supabase dashboard
2. Click "Table Editor" (left sidebar)
3. Select "profiles" table
4. You should see your user profile!

### Generate Your First Article

1. In RankPulse, click "Generate Content" in the sidebar
2. Enter a topic, e.g.:
   ```
   How to optimize website speed for better SEO rankings
   ```
3. Choose your preferences:
   - Word Count: 1500 words
   - Tone: Professional
   - Language: English
4. Click "Generate Article"
5. Wait 20-30 seconds
6. Your article will appear! ✨

---

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"

**Solution:** Make sure you created `.env.local` and added all credentials. Restart the dev server after adding env vars.

### Issue: Supabase queries failing

**Solution:**
1. Check that you ran the SQL schema in Supabase
2. Make sure Row Level Security is enabled (it's automatic from the schema)
3. Verify your API keys are correct

### Issue: Groq API errors

**Solution:**
1. Verify your API key is correct
2. Check you haven't hit rate limits (unlikely on free tier)
3. Make sure `GROQ_API_KEY` is in `.env.local` (no NEXT_PUBLIC prefix!)

### Issue: Port 3000 already in use

**Solution:** Next.js will automatically use port 3001 or 3002. Just use whatever port it shows.

---

## What's Working Right Now

✅ **Landing Page** - Beautiful homepage with features
✅ **Authentication** - Sign up and login with Supabase
✅ **Dashboard** - Overview with stats (mock data)
✅ **Content Generator** - AI-powered article generation with Groq
✅ **Sidebar Navigation** - Clean navigation system
✅ **Responsive Design** - Works on mobile, tablet, desktop

## What Needs to Be Built (Phase 2)

🚧 **Project Management** - Create and manage projects
🚧 **Articles List** - View and manage all articles
🚧 **Save to Database** - Save generated articles
🚧 **WordPress Integration** - Publish to WordPress
🚧 **Webflow Integration** - Publish to Webflow
🚧 **Shopify Integration** - Publish to Shopify
🚧 **Content Scheduler** - Schedule posts
🚧 **Team Collaboration** - Invite team members

---

## Next Steps

### Quick Test Checklist

- [ ] Landing page loads
- [ ] Can sign up for account
- [ ] Can log in
- [ ] Dashboard shows
- [ ] Can navigate between pages
- [ ] Can generate content with AI
- [ ] Generated content is editable

### Continue Development

If everything works, you're ready to:

1. **Build Project Management** - Let users create projects
2. **Implement Save to Database** - Store articles in Supabase
3. **Build WordPress Integration** - Connect and publish
4. **Add More Features** - Scheduling, templates, etc.

Refer to the main README.md for the complete feature roadmap!

---

## Deployment (When Ready)

### Deploy to Vercel (Free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables (same as .env.local)
6. Click "Deploy"
7. Done! Your app is live 🚀

**Vercel Free Tier includes:**
- Unlimited deployments
- Automatic HTTPS
- CDN
- 100GB bandwidth/month

---

## Getting Help

- Check the main `README.md` for architecture details
- Review `supabase-schema.sql` to understand database structure
- Look at the code comments for implementation details

---

## Cost Breakdown

| Service | Free Tier | What We Use |
|---------|-----------|-------------|
| Supabase | 500MB DB, 1GB storage | Database + Auth |
| Groq | Generous free | AI Generation |
| Vercel | 100GB bandwidth | Hosting |
| **Total Monthly Cost** | **$0** | 💚 |

---

🎉 **Congratulations!** You now have a working AI SEO content platform running on 100% free infrastructure!

Happy content generating! 💚
