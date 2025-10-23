# RankPulse - Quick Start Checklist

Get RankPulse up and running in 15 minutes! ⚡

---

## ✅ Pre-Setup Checklist

Before you begin, make sure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] A GitHub account (optional, for deployment)
- [ ] A code editor (VS Code recommended)

---

## 🚀 Setup Steps

### Step 1: Create Supabase Account
**Time: 5 minutes**

- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up (free, no credit card)
- [ ] Create new project named "rankpulse"
- [ ] Wait for project to provision (2-3 min)
- [ ] Go to SQL Editor
- [ ] Copy contents of `supabase-schema.sql`
- [ ] Paste and run in SQL Editor
- [ ] Go to Project Settings → API
- [ ] Copy: Project URL, anon key, service_role key

### Step 2: Get Groq API Key
**Time: 2 minutes**

- [ ] Go to [console.groq.com](https://console.groq.com)
- [ ] Sign up (free, no credit card)
- [ ] Create API key
- [ ] Copy the key immediately

### Step 3: Configure Project
**Time: 3 minutes**

```bash
# Copy env file
cp .env.local.example .env.local

# Edit .env.local and add your keys:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - GROQ_API_KEY
```

- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add all 4 API keys to `.env.local`
- [ ] Save the file

### Step 4: Install & Run
**Time: 2 minutes**

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000

### Step 5: Test It!
**Time: 3 minutes**

- [ ] Landing page loads
- [ ] Click "Get Started Free"
- [ ] Create account
- [ ] See dashboard
- [ ] Click "Generate Content"
- [ ] Enter a topic
- [ ] Click "Generate Article"
- [ ] Wait 20-30 seconds
- [ ] See generated content! 🎉

---

## 🎯 What Works Now

After setup, you can:

✅ Create an account
✅ Log in / log out
✅ View dashboard
✅ Generate AI articles
✅ Edit generated content
✅ Choose word count, tone, language

---

## 🚧 What to Build Next

The MVP is 70% complete. Still need:

### Critical (MVP)
- [ ] Save articles to database
- [ ] Articles list page
- [ ] Project management
- [ ] WordPress integration

### Nice to Have (Phase 2)
- [ ] Content scheduler
- [ ] Webflow integration
- [ ] Shopify integration
- [ ] Content templates
- [ ] Team collaboration

---

## 🐛 Quick Troubleshooting

### Issue: Can't generate content

**Check:**
1. Is `GROQ_API_KEY` in `.env.local`?
2. Did you restart dev server after adding env vars?
3. Check browser console for errors

**Solution:**
```bash
# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

### Issue: Can't sign up

**Check:**
1. Did you run the SQL schema in Supabase?
2. Are Supabase keys correct in `.env.local`?
3. Check Supabase dashboard for errors

**Solution:**
- Go to Supabase → Authentication → Users
- Check if user was created
- Check Supabase logs for errors

### Issue: Styles look broken

**Check:**
1. Is TailwindCSS installed?
2. Is `globals.css` imported in layout?

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules .next
npm install
npm run dev
```

---

## 📖 Where to Go Next

### Learn the Codebase

1. Read `PROJECT_STRUCTURE.md` - Understand the architecture
2. Read `SETUP_GUIDE.md` - Detailed setup steps
3. Read `README.md` - Features and roadmap

### Start Building

**Easy Tasks (Good First Tasks):**
1. Add user profile page
2. Add "Recent Articles" to database
3. Add project creation form

**Medium Tasks:**
4. Implement article save to database
5. Build articles list page
6. Add WordPress connection form

**Hard Tasks:**
7. Implement WordPress publishing
8. Build content scheduler
9. Add Webflow integration

---

## 🎓 Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page |
| `src/app/dashboard/page.tsx` | Dashboard home |
| `src/app/dashboard/generate/page.tsx` | Content generator UI |
| `src/app/api/generate/route.ts` | AI generation API |
| `src/lib/supabase.ts` | Database client |
| `src/lib/auth.ts` | Auth functions |
| `src/components/ui/*` | Reusable components |
| `supabase-schema.sql` | Database schema |

---

## 💡 Development Tips

### Hot Tips

1. **Use the sidebar** - All main features are linked
2. **Check browser console** - Errors show there
3. **Use Supabase dashboard** - View data in real-time
4. **Restart dev server** - After env var changes
5. **Clear .next folder** - If weird errors happen

### Useful Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Run production build

# Troubleshooting
rm -rf .next          # Clear Next.js cache
rm -rf node_modules   # Clear node modules
npm install           # Reinstall dependencies
```

---

## 🚀 Deploy to Production

When you're ready:

### Deploy to Vercel (Free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repo
4. Add environment variables
5. Click Deploy
6. Done! 🎉

**Vercel gives you:**
- Free HTTPS
- Automatic deployments
- CDN
- 100GB bandwidth/month

---

## ✅ Final Checklist

Before you start building features:

- [ ] Project runs locally
- [ ] Can create account
- [ ] Can generate content
- [ ] Database is working
- [ ] Read PROJECT_STRUCTURE.md
- [ ] Understand the tech stack
- [ ] Have API keys saved safely

---

## 🎉 You're Ready!

You now have:
- ✅ Working Next.js app
- ✅ Supabase database
- ✅ AI content generation
- ✅ Beautiful UI
- ✅ Authentication
- ✅ 100% free infrastructure

**Time to build amazing features!** 💚

---

## 📞 Need Help?

1. Check `SETUP_GUIDE.md` for detailed steps
2. Read `PROJECT_STRUCTURE.md` for architecture
3. Review code comments
4. Check Supabase docs
5. Check Next.js docs

---

**Happy coding!** 🚀

Built with 💚 by the RankPulse team
