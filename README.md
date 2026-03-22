# Doltsite - AI Website Generator

A complete AI-powered website generation system with user authentication, payment management, and persistent data storage. Build professional websites instantly with just a few clicks!

**Status**: ✅ Production-Ready | **Stack**: Next.js 14 + TypeScript + Upstash Redis

## 📋 Project Structure

```
WG/
├── app/
│   ├── api/                          # API Route Handlers
│   │   ├── auth/                     # Authentication (signup, login)
│   │   ├── generate/route.ts         # Website generation
│   │   ├── payment/                  # Payment processing
│   │   └── usage/route.ts            # Usage tracking
│   ├── admin/                        # Admin dashboard
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── components/                       # React components
├── lib/
│   ├── redis.ts                      # Redis client (Upstash)
│   ├── accounts.ts                   # Account management
│   ├── payments.ts                   # Payment management
│   └── ...
├── .env.local                        # Local environment variables (NEVER commit)
├── .env.example                      # Environment template
├── package.json                      # Node.js dependencies
├── tsconfig.json                     # TypeScript configuration
└── generated_sites/                  # Output folder for generated websites
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser
- Upstash Redis account (free tier available)
- OpenAI API key

### Installation & Setup

1. **Clone the project**

   ```bash
   cd c:\Users\HP\OneDrive\Desktop\WG
   ```

2. **Install Node.js dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in your API keys:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with:
   - `OPENAI_API_KEY` from https://platform.openai.com/api-keys
   - `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` from https://console.upstash.com
   - `JWT_SECRET` (generate a secure random string)

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:3000` (or 3001 if 3000 is in use)

## 🎯 Key Features

### ✅ Authentication System

- User sign-up with email validation
- Secure login with bcrypt password hashing
- JWT-based session management (30-day expiration)
- Logout functionality
- Cookie-based token storage (httpOnly, secure)

### ✅ Usage Tracking & Tier System

| Tier | Generations | Cost | Features |
|------|------------|------|----------|
| **Free** | 5 total | Free | Basic website generation |
| **Basic** | 10/day | $9.99/mo | Daily limit, priority support |
| **Standard** | 200 total | $29.99/mo | Advanced templates, custom domain |
| **Premium** | Unlimited | $99.99/mo | All features, white-label |

### ✅ Website Generation

- AI-powered website creation with OpenAI
- Multiple industry templates
- Customizable design styles
- Responsive HTML/CSS/JS output
- Real-time generation with usage tracking

### ✅ Payment & Upgrade System

- Tier upgrade endpoint
- Payment processing
- Subscription expiration tracking
- Usage limit enforcement

### ✅ Admin Dashboard

- View all users and usage statistics
- Monitor system health
- Password-protected interface

### ✅ Data Persistence

- Redis (Upstash) for all persistent data
- Automatic daily reset for basic tier
- Usage history and analytics

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/auth/signup` | `{email, password, name}` | `{success, account, token}` |
| POST | `/api/auth/login` | `{email, password}` | `{success, account, token}` |
| GET | `/api/auth/me` | — | `{account}` |

### Generation

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/generate` | `{prompt, style}` | `{html, css, js}` |

### Usage & Limits

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/usage` | `{usage, remaining, tier, dailyUsage}` |

### Payments

| Method | Endpoint | Body | Returns |
|--------|----------|------|---------|
| POST | `/api/upgrade` | `{tier}` | `{success, account}` |
| POST | `/api/payment/initiate` | `{tier}` | `{paymentUrl}` |
| POST | `/api/payment/approve` | `{paymentId}` | `{success, account}` |

## 🔧 Configuration

### Environment Variables

**Required for local development:**

```bash
# JWT secret for signing auth tokens
JWT_SECRET=your-secure-secret-here

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-key-here

# Upstash Redis credentials (from https://console.upstash.com)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Optional:**

```bash
# Admin password (defaults to: doltsite-admin-2025)
ADMIN_PASSWORD=your-custom-password

# App URL (for production)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Vercel Deployment

Set all environment variables in Vercel Dashboard:
1. Go to Project → Settings → Environment Variables
2. Add all variables listed above
3. Redeploy: `git push origin main`

**⚠️ NEVER commit `.env.local` to GitHub (it's in `.gitignore`)**

## 🚀 Running Commands

### Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run TypeScript & linter
```

### Build Output

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (13/13)
```

## 🛠️ Troubleshooting

### Redis Connection Issues

**Problem**: "UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set"

**Solution**: Add these to `.env.local`:
```bash
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

### OpenAI API Errors

**Problem**: "Invalid API key" or rate limiting

**Solution**:
1. Verify API key: https://platform.openai.com/api-keys
2. Check account has credits
3. Verify key is correct in `.env.local`

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**: Dev server automatically falls back to port 3001. Access `http://localhost:3001`.

### Data Lost After Redeploy

**Problem**: User accounts/usage disappeared after Vercel redeploy

**Solution**: Ensure Upstash Redis env vars are set in Vercel. Without Redis, data is in-memory only.

## 📦 Deployment

### Prerequisites

- [ ] Repository on GitHub
- [ ] Vercel account (free tier available)
- [ ] Upstash Redis account (free tier available)
- [ ] OpenAI API key with credits

### Step-by-Step Deployment

1. **Verify local build works**
   ```bash
   npm run build
   npm run lint
   ```

2. **Push to GitHub**
   ```bash
   git push origin main
   ```

3. **Create Vercel project**
   - Go to https://vercel.com
   - Click "New Project"
   - Connect GitHub repo
   - Import project

4. **Set environment variables in Vercel**
   - Project → Settings → Environment Variables
   - Add: JWT_SECRET, OPENAI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
   - Optional: ADMIN_PASSWORD, NEXT_PUBLIC_APP_URL

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Access your live site

## 📝 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Next.js Setup | ✅ Complete | v14.2.35 |
| TypeScript | ✅ Complete | Full type safety |
| Redis Persistence | ✅ Complete | Upstash integration |
| Authentication | ✅ Complete | JWT + bcrypt |
| Account Management | ✅ Complete | Tier-based limits |
| Website Generation | ✅ Complete | OpenAI integration |
| Payment System | ✅ Complete | Subscription handling |
| Admin Dashboard | ✅ Complete | User management |
| Production Build | ✅ Verified | Passes TypeScript checks |
| Vercel Deployment | ✅ Ready | All env vars configured |

## 🔐 Security Features

- Passwords hashed with bcrypt
- JWT tokens for session management
- HTTP-only cookies to prevent XSS
- Secure admin password configuration
- No secrets in version control
- Lazy-initialized Redis to prevent build errors
- Environment variable validation

## 📞 Support & Documentation

For detailed documentation, see:
- `PRODUCTION_STATUS.md` - Complete production guide
- `.env.example` - Environment variables template
- `lib/accounts.ts` - Account management reference
- `lib/redis.ts` - Redis client implementation

## 🚀 Next Steps

1. **Local Testing**: Run `npm run dev` and test sign-up/login
2. **Vercel Setup**: Connect GitHub and set environment variables
3. **Production Monitoring**: Check Vercel logs and Redis stats
4. **User Feedback**: Gather feedback and iterate
5. **Scale**: Add analytics, improve UI/UX, expand features

## 📄 License

This project is provided for educational and commercial use.

---

**Made with ❤️ - Doltsite**  
_AI-powered website generation made simple_
