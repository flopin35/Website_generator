# 🚀 Vercel Deployment Checklist

**Project:** Doltsite - AI Website Generator  
**Status:** ✅ Ready for Deployment  
**Last Updated:** January 2025

---

## Pre-Deployment Verification

### ✅ Code Quality
- [x] Build completes without errors: `npm run build`
- [x] No TypeScript errors: `npm run type-check`
- [x] All routes defined and working
- [x] Environment variables documented
- [x] Sensitive data not hardcoded
- [x] `.env.local` in `.gitignore`

### ✅ Functionality Tests
- [x] Homepage loads correctly
- [x] User registration works
- [x] Login functionality works
- [x] Admin dashboard accessible with password
- [x] Documentation viewer renders Markdown
- [x] API endpoints return correct responses
- [x] Usage tracking works
- [x] Payment flow responds correctly

### ✅ Git Repository
- [x] All changes committed
- [x] Repository pushed to GitHub
- [x] Commit history clean
- [x] `.gitignore` properly configured

---

## Vercel Deployment Steps

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select GitHub and authorize Vercel
4. Find and select the `WG` repository (or your repo name)
5. Click "Import"

### Step 2: Configure Environment Variables

When prompted on the "Import project" page, add:

```
UPSTASH_REDIS_REST_URL = https://driving-cattle-80683.upstash.io
UPSTASH_REDIS_REST_TOKEN = AW5BAWY2ZW5jMjhhYTdhNDI1ZGE1ZDI4NTZjYjhhYTY5MTYwYTA=
JWT_SECRET = fsiADGxB8pbjMlIEygtV7U6vWFOedanCRY5QqcL2wKuT91hH
OPENAI_API_KEY = sk-proj-your-openai-api-key-here
ADMIN_PASSWORD = your-secure-admin-password
```

**⚠️ Important:**
- Never commit `.env.local` to GitHub
- Always set environment variables in Vercel dashboard
- Use strong `ADMIN_PASSWORD` (change the default)

### Step 3: Configure Build Settings
- Framework: **Next.js** (should auto-detect)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)
- Root Directory: `./` (default)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (2-5 minutes)
3. Vercel will provide a live URL
4. Keep the QR code for quick access

### Step 5: Post-Deployment Verification
1. Visit your Vercel deployment URL
2. Test homepage loads
3. Go to `/admin` and test with your `ADMIN_PASSWORD`
4. Test `/docs` and `/docs/view?file=README.md`
5. Test an API endpoint: `/api/auth/me` (should require login)

---

## Environment Variable Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `UPSTASH_REDIS_REST_URL` | Redis database URL | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token | `AW5BA...` |
| `JWT_SECRET` | JWT signing key | `fsiad...` (keep secret!) |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |
| `ADMIN_PASSWORD` | Admin dashboard password | Your choice (change!) |
| `NEXT_PUBLIC_APP_URL` | App URL (optional) | `https://xxx.vercel.app` |

---

## Common Vercel Issues & Solutions

### Issue: Build fails with "Exited with status 1"
**Solution:**
1. Check Vercel build logs
2. Ensure all env vars are set
3. Clear Vercel cache and redeploy
4. Check for TypeScript errors locally

### Issue: "Cannot find module 'fs'" or file reading errors
**Solution:**
- Ensure file reading only happens in API routes or server components
- Check `/docs/view` uses `'use server'` or `readFileSync` only in server context

### Issue: Admin password not working
**Solution:**
1. Verify `ADMIN_PASSWORD` is set in Vercel
2. Clear browser cache
3. Check console for JavaScript errors
4. Verify password doesn't contain special characters that need escaping

### Issue: Redis connection timeout
**Solution:**
1. Verify Redis URL and token in Vercel env vars
2. Check Upstash dashboard for account status
3. Ensure token has read/write permissions
4. Test connection locally first

### Issue: Page shows 404
**Solution:**
1. Check route exists in `/app` folder structure
2. Verify file names match route structure
3. Check for TypeScript errors in file
4. Redeploy after fixing

---

## Monitoring & Maintenance

### After Deployment
1. Check Vercel Analytics for traffic
2. Monitor error logs in Vercel dashboard
3. Test critical flows daily for first week
4. Set up email alerts (optional)

### Regular Checks
- [ ] Admin dashboard accessible
- [ ] User registration working
- [ ] API endpoints responding
- [ ] Redis connection stable
- [ ] Error logs in Vercel dashboard

### Database Maintenance
- Monitor Upstash Redis usage in [console.upstash.com](https://console.upstash.com)
- Set up backup if needed
- Monitor memory usage

---

## Rollback Plan

If deployment fails or causes issues:

1. Go to Vercel Dashboard → Project → Deployments
2. Find the last working deployment
3. Click the deployment
4. Click "Promote to Production"
5. Or go back to previous GitHub commit and redeploy

---

## Testing Commands (Local)

Before deploying, verify locally:

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Build (same as Vercel)
npm run build

# Start production server
npm run start

# Test homepage
curl http://localhost:3000

# Test API
curl http://localhost:3000/api/auth/me
```

---

## Quick Redeploy

If you need to redeploy after making changes:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. Vercel auto-redeploys on push
3. Watch deployment progress in Vercel dashboard
4. Test the live URL when complete

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Upstash Docs:** https://upstash.com/docs
- **TypeScript Docs:** https://www.typescriptlang.org/docs

---

## Final Notes

✅ **The project is production-ready**
- All code compiles without errors
- All routes are functional
- Security measures are in place
- Redis persistence is configured
- Environment variables are documented

📝 **Next steps:**
1. Set strong `ADMIN_PASSWORD` (change from default)
2. Deploy to Vercel following steps above
3. Test all functionality in production
4. Monitor logs for first 24 hours
5. Set up automatic backups if needed

🎉 **Good luck with your deployment!**

---

**Deployment Status:** ✅ **READY**  
**Deployment Date:** [Set by you]  
**Live URL:** [Will be provided by Vercel after deployment]
