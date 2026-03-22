# Doltsite - Start Here 🚀

Welcome to **Doltsite** - an AI-powered website generator built with Next.js, TypeScript, and Upstash Redis.

## What is Doltsite?

Doltsite is a **full-stack web application** that lets users:
- Create professional websites with AI
- Track usage with tier-based limits
- Upgrade to premium plans
- Manage accounts with secure authentication

**Status**: ✅ **Production-Ready** | **Live Demo**: http://localhost:3001

---

## 📖 Documentation Index

### For First-Time Users
1. **[QUICK_START.md](QUICK_START.md)** ⭐ - Start here! 5-minute local setup
   - Install dependencies
   - Configure environment
   - Run locally
   - Test the app

### For Developers
2. **[README.md](README.md)** - Project overview & tech stack
   - Architecture
   - API endpoints
   - Feature list
   - Configuration

3. **[PRODUCTION_STATUS.md](PRODUCTION_STATUS.md)** - Complete production guide
   - Architecture details
   - Environment variables
   - File structure
   - Configuration guide

### For QA & Testing
4. **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive testing procedures
   - Authentication tests
   - Usage tracking tests
   - Payment tests
   - Admin dashboard tests
   - Full test checklist

### For Deployment
5. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Step-by-step Vercel deployment
   - Prerequisites
   - Pre-deployment verification
   - GitHub setup
   - Vercel configuration
   - Environment variables
   - Post-deployment checks
   - Troubleshooting

### Project Status
6. **[COMPLETE_STATUS_REPORT.md](COMPLETE_STATUS_REPORT.md)** - Detailed project status
   - What's implemented
   - Test results
   - Performance metrics
   - Known limitations
   - Next steps

---

## 🎯 Quick Navigation

### Get Running in 5 Minutes
```bash
cd c:\Users\HP\OneDrive\Desktop\WG
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
# Visit http://localhost:3001
```

### Key Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Check TypeScript & linting
```

### Project Structure
```
WG/
├── app/              # Next.js pages & API routes
├── components/       # React components
├── lib/              # Business logic (accounts, payments, redis)
├── .env.local        # Your API keys (NEVER commit)
├── .env.example      # Template
└── package.json      # Dependencies
```

---

## 🔑 Key Features

✅ **User Authentication** - Sign up, login, logout with JWT  
✅ **Tier System** - Free (5), Basic (10/day), Standard (200), Premium (∞)  
✅ **Website Generation** - AI-powered using OpenAI API  
✅ **Usage Tracking** - Real-time limits per user  
✅ **Payment System** - Upgrade to higher tiers  
✅ **Admin Dashboard** - Monitor users and usage  
✅ **Persistent Storage** - Redis for data persistence  
✅ **Beautiful UI** - Modern, responsive design  

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Next.js API Routes + TypeScript
- **Database**: Upstash Redis (REST API)
- **Auth**: JWT tokens + bcrypt
- **AI**: OpenAI API
- **Hosting**: Vercel
- **Package Manager**: npm

---

## 📋 Common Tasks

### Setup Locally
👉 Follow **[QUICK_START.md](QUICK_START.md)**

### Test Functionality
👉 Follow **[TESTING_GUIDE.md](TESTING_GUIDE.md)**

### Deploy to Production
👉 Follow **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

### Understand Architecture
👉 Read **[PRODUCTION_STATUS.md](PRODUCTION_STATUS.md)**

### Check Project Status
👉 Review **[COMPLETE_STATUS_REPORT.md](COMPLETE_STATUS_REPORT.md)**

---

## 🔐 Environment Variables

You'll need:
- **OpenAI API Key** - Get from https://platform.openai.com/api-keys
- **Upstash Redis** - Create free at https://console.upstash.com
- **JWT Secret** - Any random string (32+ chars recommended)

See **[QUICK_START.md](QUICK_START.md)** for detailed setup.

---

## 🚀 Deploy to Production

1. **Verify local build works**
   ```bash
   npm run build
   npm run lint
   ```

2. **Push to GitHub**
   ```bash
   git push origin main
   ```

3. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repo
   - Set environment variables
   - Deploy

👉 Detailed steps in **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

---

## 📊 Project Status

| Component | Status |
|-----------|--------|
| Frontend UI | ✅ Complete |
| Authentication | ✅ Complete |
| Website Generation | ✅ Complete |
| Usage Tracking | ✅ Complete |
| Payment System | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| Redis Persistence | ✅ Complete |
| Documentation | ✅ Complete |
| Production Build | ✅ Verified |

---

## 🎓 Learning Resources

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### TypeScript
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

### Upstash Redis
- [Upstash Docs](https://upstash.com/docs/redis)
- [Upstash Console](https://console.upstash.com)

### Vercel Deployment
- [Vercel Docs](https://vercel.com/docs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🐛 Troubleshooting

### Port 3000 in use?
Dev server automatically falls back to 3001. Access `http://localhost:3001`

### Can't login?
Check your `.env.local` has correct Upstash credentials.

### OpenAI errors?
Verify API key is correct and has credits available.

### Need help?
1. Check the relevant guide (QUICK_START, DEPLOYMENT, TESTING, etc.)
2. Review browser console (F12) for error details
3. Check Vercel logs: `vercel logs --follow`

---

## 🎯 Next Steps

1. **[QUICK_START.md](QUICK_START.md)** - Get running locally (5 min)
2. **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Test functionality
3. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deploy to production

---

## 📞 Help & Support

- **Documentation**: See files listed above
- **GitHub Issues**: https://github.com/flopin35/Website_generator/issues
- **Vercel Logs**: `vercel logs --follow`
- **Browser Console**: F12 → Console tab

---

## ✨ Summary

**Doltsite is a production-ready, feature-complete AI website generator.**

It has everything needed to launch a successful product:
- Secure authentication
- Usage tracking & tier limits
- Payment system
- Beautiful UI
- Scalable architecture
- Comprehensive documentation

**Ready to launch?** → Go to **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

---

**Current Status**: ✅ Production-Ready  
**Latest Version**: 1.0.0  
**Last Updated**: January 2025  
**Repository**: https://github.com/flopin35/Website_generator
