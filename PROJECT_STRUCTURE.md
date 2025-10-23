# RankPulse - Project Structure

## 📁 Directory Overview

```
rankpulse/
├── .next/                      # Next.js build output (auto-generated)
├── node_modules/               # Dependencies (auto-generated)
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   │   └── generate/      # AI content generation endpoint
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/        # Login page
│   │   │   └── signup/       # Signup page
│   │   ├── dashboard/         # Protected dashboard routes
│   │   │   ├── generate/     # Content generator UI
│   │   │   ├── layout.tsx    # Dashboard layout with sidebar
│   │   │   └── page.tsx      # Dashboard home
│   │   ├── globals.css        # Global styles & Tailwind
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   │   └── sidebar.tsx   # Navigation sidebar
│   │   └── ui/               # Reusable UI components
│   │       ├── button.tsx    # Button component
│   │       ├── card.tsx      # Card component
│   │       └── input.tsx     # Input/Textarea/Select components
│   └── lib/                   # Utilities and configurations
│       ├── auth.ts           # Authentication service
│       └── supabase.ts       # Supabase client & types
├── .env.local                 # Environment variables (create this!)
├── .env.local.example         # Example env file
├── .gitignore                # Git ignore rules
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies & scripts
├── postcss.config.js         # PostCSS config
├── README.md                 # Main documentation
├── SETUP_GUIDE.md            # Step-by-step setup
├── supabase-schema.sql       # Database schema
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

---

## 🎨 Component Architecture

### UI Components (`src/components/ui/`)

**Purpose:** Reusable, styled components used throughout the app.

- **button.tsx** - Versatile button with variants (primary, secondary, outline, ghost, danger)
- **card.tsx** - Container component with header, content, footer sections
- **input.tsx** - Form inputs (Input, Textarea, Select) with labels and error states

**Usage Example:**
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

<Card>
  <CardHeader>
    <CardTitle>Sign Up</CardTitle>
  </CardHeader>
  <CardContent>
    <Input label="Email" type="email" required />
    <Button variant="primary">Submit</Button>
  </CardContent>
</Card>
```

### Dashboard Components (`src/components/dashboard/`)

**Purpose:** Dashboard-specific, complex components.

- **sidebar.tsx** - Navigation sidebar with menu items and active state

---

## 🛣️ Routing Structure

### Public Routes

- `/` - Landing page
- `/auth/login` - Login page
- `/auth/signup` - Signup page

### Protected Routes (require authentication)

- `/dashboard` - Dashboard home with stats
- `/dashboard/generate` - Content generator
- `/dashboard/projects` - Project management (to build)
- `/dashboard/articles` - Articles list (to build)
- `/dashboard/schedule` - Content calendar (to build)
- `/dashboard/integrations` - CMS connections (to build)
- `/dashboard/settings` - User settings (to build)

---

## 🔌 API Routes

### `/api/generate` (POST)

**Purpose:** Generate AI content using Groq API

**Request Body:**
```json
{
  "topic": "How to optimize website speed",
  "wordCount": 1500,
  "tone": "professional",
  "language": "English"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Generated title",
    "content": "Full article content...",
    "metaDescription": "150 char description",
    "wordCount": 1523
  }
}
```

**Implementation:** Uses Groq SDK with `mixtral-8x7b-32768` model

---

## 🗄️ Database Schema

### Tables (see `supabase-schema.sql`)

1. **profiles** - User profiles (extends auth.users)
   - id, email, full_name, avatar_url, organization_name

2. **projects** - Content projects/websites
   - id, user_id, name, website_url, language, brand_voice

3. **articles** - Generated articles
   - id, project_id, title, content, word_count, status

4. **cms_connections** - Platform integrations
   - id, project_id, platform, api_url, api_key

5. **keywords** - Keyword tracking
   - id, project_id, keyword, priority

6. **content_templates** - Reusable templates
   - id, user_id, name, prompt_structure

### Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View their own data
- Create data for themselves
- Update their own data
- Delete their own data

---

## 🎨 Design System

### Colors (Tailwind Config)

```css
Primary Green: #00AA45
Green Light:   #E6F7EE
Green Dark:    #008837

Gray Scale:
  50:  #F9FAFB
  100: #F3F4F6
  ...
  900: #1F2937
```

### Typography

- Font: System font stack (native OS fonts)
- Headings: Bold, larger sizes
- Body: Regular weight, readable sizes

### Spacing

- Consistent 4px grid (Tailwind default)
- Card padding: `p-6` (24px)
- Section spacing: `mb-8` (32px)

### Shadows

- Card: `shadow-sm` (subtle)
- Hover: `hover:shadow-md` (medium)
- Button: `shadow-lg` (pronounced)

---

## 🔐 Authentication Flow

### Sign Up
1. User fills form → `/auth/signup`
2. Client calls `authService.signUp()`
3. Supabase creates user in `auth.users`
4. Trigger automatically creates profile in `profiles` table
5. User redirected to `/dashboard`

### Log In
1. User fills form → `/auth/login`
2. Client calls `authService.signIn()`
3. Supabase validates credentials
4. Session stored in browser
5. User redirected to `/dashboard`

### Protected Routes
- Check session with `authService.getSession()`
- Redirect to `/auth/login` if not authenticated

---

## 🤖 AI Content Generation Flow

1. User enters topic + preferences
2. Frontend calls `/api/generate` (POST)
3. API builds prompt with parameters
4. Groq API generates content (20-30 seconds)
5. API parses response:
   - Extracts title
   - Extracts meta description
   - Counts words
   - Formats content
6. Returns structured JSON
7. Frontend displays in editable form

---

## 🚀 Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GROQ_API_KEY=...
```

**Note:**
- `NEXT_PUBLIC_*` = exposed to browser
- Others = server-only

---

## 📦 Key Dependencies

### Production Dependencies

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react` | UI library |
| `@supabase/supabase-js` | Database & auth |
| `groq-sdk` | AI content generation |
| `zustand` | State management |
| `react-hook-form` | Form handling |
| `zod` | Schema validation |
| `lucide-react` | Icons |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `eslint` | Code linting |
| `autoprefixer` | CSS prefixes |

---

## 🔄 State Management

Currently using:
- **React useState** - Local component state
- **Supabase** - Server state (database)
- **Next.js routing** - URL state

Future (if needed):
- **Zustand** - Global client state
- **React Context** - Theme, user preferences

---

## 🎯 Next Features to Build

### Phase 2 (MVP Completion)

1. **Project Management**
   - Create project form
   - Project list
   - Project settings

2. **Article Database**
   - Save generated articles
   - Articles list page
   - Edit article page
   - Delete articles

3. **WordPress Integration**
   - Connection form
   - Test connection
   - Publish article API

### Phase 3 (Enhanced Features)

4. **Content Scheduler**
   - Calendar UI
   - Schedule article
   - Cron job for auto-publish

5. **Webflow & Shopify**
   - Connection forms
   - Publish endpoints

6. **Templates**
   - Template library
   - Custom templates
   - Template picker in generator

---

## 🧪 Testing Strategy

### Manual Testing
- Test each page loads
- Test form validations
- Test API endpoints
- Test responsive design

### Future (Automated Testing)
- Unit tests with Jest
- Integration tests with Playwright
- E2E tests for critical flows

---

## 📚 Code Style Guidelines

### TypeScript

- Use strict types (no `any`)
- Define interfaces for props
- Use type inference where possible

### React

- Functional components only
- Use hooks properly
- Keep components small
- One component per file

### File Naming

- Components: PascalCase (Button.tsx)
- Utilities: camelCase (auth.ts)
- Pages: lowercase (page.tsx)

### CSS/Tailwind

- Use Tailwind classes
- Group classes logically
- Use design system colors
- Responsive mobile-first

---

## 🔍 Debugging Tips

### Common Issues

**"Module not found"**
- Check import paths use `@/` alias
- Verify file exists

**"API route not working"**
- Check route.ts exports POST/GET
- Verify env vars are set
- Restart dev server after env changes

**"Supabase query fails"**
- Check RLS policies
- Verify user is authenticated
- Check table/column names

**"Styles not applying"**
- Check Tailwind config
- Verify content paths
- Clear `.next` folder

---

## 📈 Performance Optimizations

### Already Implemented

- Server components by default
- Static landing page
- Optimized font loading
- Tailwind purging unused CSS

### Future Optimizations

- Image optimization with next/image
- Code splitting with dynamic imports
- Caching with SWR or React Query
- Database query optimization

---

## 🔒 Security Considerations

### Current

✅ Row Level Security on all tables
✅ Supabase Auth handles password hashing
✅ API keys in environment variables
✅ HTTPS enforced (Vercel)

### To Implement

- [ ] Encrypt CMS API keys in database
- [ ] Rate limiting on API routes
- [ ] Input sanitization
- [ ] CSRF protection
- [ ] Content Security Policy headers

---

## 📝 Documentation

- **README.md** - Overview, features, tech stack
- **SETUP_GUIDE.md** - Step-by-step setup
- **PROJECT_STRUCTURE.md** - This file
- **supabase-schema.sql** - Database documentation

---

## 🎓 Learning Resources

### Next.js 14
- [Official Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Supabase
- [Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)

### Tailwind CSS
- [Docs](https://tailwindcss.com/docs)
- [Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

### Groq AI
- [API Docs](https://console.groq.com/docs)
- [Models](https://console.groq.com/docs/models)

---

**Last Updated:** 2025-10-23

Happy coding! 💚
