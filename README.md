# RankPulse - AI SEO Content Automation Platform

> **Pulse Your Content to the Top**

RankPulse is a complete AI-powered SEO content automation platform that generates SEO-optimized long-form articles and publishes them directly to WordPress, Webflow, and Shopify.

## ✨ Features

- 🤖 AI-powered content generation (up to 3000 words)
- 🌍 150+ languages support
- 📅 Content scheduling
- 🔗 WordPress, Webflow, and Shopify integration
- 👥 Team collaboration
- 📊 Analytics dashboard
- 💰 **100% FREE infrastructure** (zero cost to run)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier)
- Groq API key (free)

### 1. Clone and Install

```bash
cd rankpulse
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the schema from `supabase-schema.sql`
4. Get your project credentials:
   - Go to Project Settings → API
   - Copy the `Project URL` and `anon/public` key

### 3. Get Groq API Key

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create a new API key (free tier available)

### 4. Configure Environment Variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI:** Groq API (free, fast LLM)
- **Deployment:** Vercel (free tier)

## 📁 Project Structure

```
rankpulse/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   └── ui/          # Reusable UI components
│   └── lib/             # Utilities and configurations
├── public/              # Static assets
├── supabase-schema.sql  # Database schema
└── README.md
```

## 🔧 Configuration

### Tailwind Colors

The project uses a custom green color scheme:

```css
Primary Green: #00AA45
Green Light: #E6F7EE
Green Dark: #008837
```

### Database Schema

The complete database schema is in `supabase-schema.sql`. It includes:

- `profiles` - User profiles
- `projects` - Content projects/websites
- `articles` - Generated articles
- `cms_connections` - CMS integrations
- `keywords` - Keyword tracking
- `content_templates` - Reusable templates

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel's free tier includes:
- Unlimited deployments
- Automatic HTTPS
- 100 GB bandwidth/month
- Edge functions

## 📖 Usage Guide

### Creating Your First Article

1. Sign up for an account
2. Create a new project
3. Go to "Generate Content"
4. Enter your topic and preferences
5. Click "Generate" and wait for AI to create your article
6. Edit if needed, then publish or schedule

### Connecting WordPress

1. Go to Integrations
2. Select WordPress
3. Enter your site URL
4. Generate an Application Password in WordPress
5. Test connection and save

### Scheduling Content

1. Create or edit an article
2. Click "Schedule"
3. Select date and time
4. Save - article will auto-publish at scheduled time

## 🆓 Free Tier Limits

### Supabase (Free)
- 500 MB database
- 1 GB file storage
- 50K monthly active users

### Groq (Free)
- Generous free tier
- Fast inference

### Vercel (Free)
- Unlimited hobby projects
- 100 GB bandwidth/month

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues or questions:
- Open a GitHub issue
- Check the documentation
- Review the SQL schema

---

Made with 💚 by the RankPulse team
