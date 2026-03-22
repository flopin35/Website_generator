# Doltsite - Production Deployment Guide

Complete step-by-step guide to deploy Doltsite to production on Vercel.

## Prerequisites

Before deploying, ensure you have:

✅ **GitHub Account** - To host the code  
✅ **Vercel Account** - For hosting (free tier available)  
✅ **Upstash Account** - For Redis (free tier available)  
✅ **OpenAI API Key** - With available credits  
✅ **Local Project** - Running successfully with `npm run dev`

## Phase 1: Pre-Deployment Verification (Local)

### 1.1 Verify Build Works

```bash
cd c:\Users\HP\OneDrive\Desktop\WG
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (13/13)
```

If this fails, fix errors locally before deploying.

### 1.2 Test Production Build Locally

```bash
npm run build
npm run start
```

Access: http://localhost:3000

Test:
- [ ] Sign up works
- [ ] Login works
- [ ] Can generate website
- [ ] Admin dashboard accessible

### 1.3 Check Environment Configuration

```bash
# In .env.local, verify you have:
cat .env.local
```

Must have:
- ✅ OPENAI_API_KEY (not empty, not "sk-your-key-here")
- ✅ UPSTASH_REDIS_REST_URL (not empty, https://...)
- ✅ UPSTASH_REDIS_REST_TOKEN (not empty)
- ✅ JWT_SECRET (at least 32 characters)

### 1.4 Verify .env.local is in .gitignore

```bash
cat .gitignore | grep env.local
```

Should output: `.env.local`

If not in .gitignore, add it:
```bash
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Ensure .env.local is in gitignore"
```

### 1.5 Verify Git is Clean

```bash
git status
```

Should show: `nothing to commit, working tree clean`

If not, commit changes:
```bash
git add .
git commit -m "Final changes before deployment"
```

## Phase 2: GitHub Setup

### 2.1 Push Latest Code to GitHub

```bash
git push origin main
```

Wait for push to complete. Verify on GitHub: https://github.com/flopin35/Website_generator

### 2.2 Verify GitHub Repository

Check:
- [ ] Latest code is on `main` branch
- [ ] `.env.local` is NOT in repository
- [ ] `package.json` exists
- [ ] `README.md` exists

## Phase 3: Vercel Setup

### 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### 3.2 Create Vercel Project

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Find "Website_generator" and click "Import"
4. **DO NOT DEPLOY YET** — You need to add environment variables first

### 3.3 Add Environment Variables in Vercel

In the import flow, you'll see "Environment Variables" section.

Add the following variables:

| Variable | Value | Source |
|----------|-------|--------|
| `JWT_SECRET` | Generate random string (32+ chars) | `cat /dev/urandom \| base64 \| head -c 32` |
| `OPENAI_API_KEY` | `sk-proj-...` | https://platform.openai.com/api-keys |
| `UPSTASH_REDIS_REST_URL` | `https://...upstash.io` | https://console.upstash.com |
| `UPSTASH_REDIS_REST_TOKEN` | Your token | https://console.upstash.com |
| `ADMIN_PASSWORD` | Your choice | Whatever you want |

**How to get each:**

#### JWT_SECRET
Generate a random 32-character string:
- Windows PowerShell:
  ```powershell
  -join ([char[]]'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' | Get-Random -Count 32)
  ```
- Or just use any long random string like: `aB3$xKmP9@Lq#Vw7Yz2Dc5FgH8Jn4Rs6Tu`

#### OPENAI_API_KEY
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-`)
4. Paste into Vercel

#### UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN
1. Go to https://console.upstash.com
2. Click "Create Database"
3. Choose "Multi-Region" or "Single Region" (free tier works)
4. Click "Create"
5. Go to "REST API" tab
6. Copy:
   - `UPSTASH_REDIS_REST_URL` (looks like `https://driving-cattle-12345.upstash.io`)
   - `UPSTASH_REDIS_REST_TOKEN` (long base64 string)

#### ADMIN_PASSWORD
Choose something secure and different from your login password.
Example: `MySecure@dmin2025`

### 3.4 Configure Build Settings

Keep defaults:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3.5 Deploy

1. Click "Deploy" button
2. Wait for deployment to complete (takes 2-5 minutes)

Expected output:
```
✓ Production build complete
✓ Assigned domain: xxx.vercel.app
✓ Ready to access
```

## Phase 4: Post-Deployment Verification

### 4.1 Access Your Live Site

1. After deployment, you'll see a URL like: `https://website-generator-xxx.vercel.app`
2. Click the link or navigate to it

### 4.2 Test Core Functionality

#### Sign Up
1. Click "Sign Up"
2. Create account with test data
3. Verify account created and logged in

#### Login
1. Logout
2. Try login with same credentials
3. Verify login successful

#### Generate Website
1. Enter a prompt
2. Click "Generate"
3. Verify website preview shows

#### Admin Dashboard
1. Go to `/admin`
2. Enter admin password
3. Verify dashboard loads

### 4.3 Check Redis Connection

1. In Vercel, go to Project → Deployments
2. Click on latest deployment
3. Go to "Function Logs" tab
4. Trigger an action (sign up, generate) and watch logs
5. Should see successful Redis operations (no errors)

### 4.4 Monitor Vercel Logs

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# View logs (requires authentication)
vercel logs --follow
```

Should show:
```
✓ [api/auth/signup] User created
✓ [api/generate] Website generated
✓ [redis] Data persisted
```

## Phase 5: Domain Setup (Optional)

### Add Custom Domain

1. In Vercel Project → Settings → Domains
2. Add your domain (e.g., `doltsite.com`)
3. Update DNS records in your domain registrar
4. Wait for DNS to propagate (5-30 minutes)

### Update NEXT_PUBLIC_APP_URL

If using custom domain, update in Vercel env vars:

```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Then redeploy:
```bash
git push origin main  # Triggers automatic redeploy
```

## Phase 6: Production Monitoring

### 6.1 Set Up Error Alerts

In Vercel:
1. Project → Settings → Error Notifications
2. Add email to be notified of failures

### 6.2 Monitor Redis Usage

In Upstash:
1. Go to your database
2. Check "Stats" tab for:
   - Total requests
   - Data stored
   - Response time

### 6.3 Monitor OpenAI Usage

1. Go to https://platform.openai.com/account/usage
2. Monitor API calls and costs
3. Set up billing alerts if needed

### 6.4 Regular Backups

**Upstash** automatically backs up data, but you can:
1. Manually export data from https://console.upstash.com
2. Save backups to secure location
3. Test restores periodically

## Troubleshooting Deployment

### Build Failed: "Cannot find module '@upstash/redis'"

**Fix**: 
```bash
npm install @upstash/redis
git push origin main
```

### Deployment Failed: "Missing Environment Variable"

**Check**:
1. Vercel → Project Settings → Environment Variables
2. Verify all variables are set
3. Check for typos in variable names
4. Redeploy: Vercel → Deployments → Redeploy

### Site Not Connecting to Redis

**Check**:
1. UPSTASH_REDIS_REST_URL is correct (https://...)
2. UPSTASH_REDIS_REST_TOKEN is correct (not truncated)
3. Upstash database is running (https://console.upstash.com)
4. Redis quota not exceeded

**Fix**:
1. Update env vars in Vercel
2. Redeploy

### Slow Response Times

**Check**:
1. Redis response time in Upstash dashboard
2. OpenAI API latency
3. Vercel function cold starts

**Optimize**:
1. Upgrade Upstash to paid tier
2. Use edge regions closest to users
3. Implement caching

### Users Can't Login After Redeploy

**Cause**: Missing Redis credentials  
**Fix**: Verify UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env vars

## Rollback Procedure

If deployment has critical issues:

### Option 1: Revert to Previous Deployment (Easiest)

1. Vercel → Project → Deployments
2. Find last known good deployment
3. Click "..." → "Promote to Production"

### Option 2: Rollback Code

```bash
# Find last good commit
git log --oneline -5

# Revert to specific commit
git revert <commit-hash>

# Push to trigger redeploy
git push origin main
```

## Success Checklist

- [ ] GitHub repo updated
- [ ] Vercel project created
- [ ] All env vars set in Vercel
- [ ] Initial deployment successful
- [ ] Can sign up on live site
- [ ] Can login on live site
- [ ] Can generate websites
- [ ] Admin dashboard works
- [ ] Redis persisting data
- [ ] No errors in Vercel logs
- [ ] OpenAI API responding
- [ ] Domain configured (if applicable)

## Post-Deployment Maintenance

### Daily
- Check Vercel deployment logs
- Monitor error rates

### Weekly
- Review user accounts and usage
- Check API costs (OpenAI)
- Verify Redis data growth

### Monthly
- Review performance metrics
- Update dependencies: `npm update`
- Optimize slow endpoints

## 📞 Support

For deployment issues:

1. Check Vercel logs: `vercel logs --follow`
2. Check Redis status: https://console.upstash.com
3. Verify OpenAI API: https://platform.openai.com/account/usage
4. Review `PRODUCTION_STATUS.md` for architecture details
5. Check GitHub issues for known problems

## Success! 🎉

Your Doltsite is now live in production!

**Next Steps**:
- Share your URL with users
- Gather feedback
- Monitor usage and costs
- Iterate on features

---

**Deployment Date**: [Your Date]  
**Site URL**: [Your URL]  
**Status**: ✅ Live
