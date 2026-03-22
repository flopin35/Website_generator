# Quick Start Guide for Doltsite

Get the Doltsite AI Website Generator running locally in 5 minutes.

## Prerequisites

Make sure you have:

- **Node.js 18+** - Download from https://nodejs.org/
- **npm** (comes with Node.js)
- A **GitHub account** and this repo cloned
- **OpenAI API key** - Get from https://platform.openai.com/api-keys
- **Upstash Redis** - Create free account at https://console.upstash.com

## 🚀 Step-by-Step Setup (5 min)

### 1. Navigate to Project

```bash
cd c:\Users\HP\OneDrive\Desktop\WG
```

### 2. Install Dependencies

```bash
npm install
```

**Expected**: Takes ~2-3 minutes, installs ~500 packages.

### 3. Create Environment File

Copy the template:

```bash
cp .env.example .env.local
```

### 4. Add Your API Keys to `.env.local`

Edit `c:\Users\HP\OneDrive\Desktop\WG\.env.local`:

```bash
# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your-key-here

# Get from https://console.upstash.com → Create Database → REST API tab
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# JWT secret for user sessions (just pick something random)
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production

# Optional: custom admin password (default is: doltsite-admin-2025)
ADMIN_PASSWORD=my-admin-password
```

### 5. Start Development Server

```bash
npm run dev
```

**Expected output:**

```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
✓ Ready in 7.3s
```

If port 3000 is in use, it will automatically try port 3001.

### 6. Open in Browser

Navigate to: **http://localhost:3000** (or 3001)

## ✅ Test It Out

### Create an Account

1. Click "Sign Up"
2. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `TestPassword123`
3. Click "Create Account"

Expected: Account created, redirected to dashboard.

### Generate a Website

1. You should see "Free tier - 5 generations remaining"
2. Enter a prompt: "Create a landing page for a coffee shop"
3. Click "Generate"

Expected: HTML website generated and displayed in preview.

### Check Admin Dashboard

1. Go to: **http://localhost:3000/admin**
2. Enter password: `doltsite-admin-2025` (or your custom `ADMIN_PASSWORD`)
3. View all users and statistics

## 📁 Important Files

| File              | Purpose                               |
| ----------------- | ------------------------------------- |
| `.env.local`      | Your API keys (⚠️ NEVER commit this!) |
| `lib/redis.ts`    | Redis connection                      |
| `lib/accounts.ts` | User management                       |
| `app/api/`        | API endpoints                         |
| `app/page.tsx`    | Home page UI                          |

## 🔧 Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Check TypeScript types
npx tsc --noEmit

# Run linter
npm run lint
```

## ❌ Troubleshooting

### Error: "OPENAI_API_KEY not set"

**Fix**: Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### Error: "UPSTASH_REDIS_REST_URL not set"

**Fix**: Add to `.env.local`:

```bash
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

Get these from: https://console.upstash.com → Create Database → REST API

### Port 3000 already in use

**Solution**: Dev server automatically falls back to 3001. Access **http://localhost:3001**

### Can't login after restart

**Check**:

1. Verify Upstash credentials in `.env.local`
2. Check Redis is running at https://console.upstash.com
3. Verify database isn't full (delete old data if needed)

### TypeError: Cannot read property of undefined

**Check**: Are all environment variables in `.env.local`? Run `npm run build` to verify.

## 📚 Next Steps

1. **Customize**: Edit `app/page.tsx` to customize UI
2. **Add Features**: Implement new API endpoints in `app/api/`
3. **Deploy**: Push to GitHub, connect to Vercel
4. **Monitor**: Check Vercel logs and Redis stats

## 🚀 Deploy to Production (Vercel)

```bash
# 1. Commit changes
git add .
git commit -m "Ready for production"

# 2. Push to GitHub
git push origin main

# 3. In Vercel:
#    - Set env vars (JWT_SECRET, OPENAI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)
#    - Deploy
```

## 📞 Need Help?

1. Check `README.md` for detailed documentation
2. See `PRODUCTION_STATUS.md` for production setup
3. Read `TESTING_GUIDE.md` for testing procedures
4. Check browser console (F12) for error messages
5. Review Vercel logs: `vercel logs --follow`

## ✨ You're All Set!

You now have a fully functional AI website generator running locally. Start building! 🚀

---

**Project**: Doltsite - AI Website Generator  
**Status**: ✅ Production-Ready  
**Last Updated**: January 2025
