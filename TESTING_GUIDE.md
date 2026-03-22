# Testing & Verification Guide for Doltsite

**Purpose**: Verify that all components are working correctly before production deployment.

## ✅ Local Testing Checklist

### 1. Environment Setup

- [ ] `.env.local` file exists with all required variables
- [ ] `OPENAI_API_KEY` is valid and has credits
- [ ] `UPSTASH_REDIS_REST_URL` points to valid Upstash instance
- [ ] `UPSTASH_REDIS_REST_TOKEN` is correct
- [ ] `JWT_SECRET` is set (at least 32 characters recommended)

### 2. Build Verification

```bash
npm run build
```

Expected output:

- ✓ Compiled successfully
- ✓ Linting and checking validity of types
- ✓ Generating static pages (13/13)
- No errors in output

### 3. TypeScript Checks

```bash
npx tsc --noEmit
```

Expected: No errors, only warnings if any.

### 4. Linting

```bash
npm run lint
```

Expected: No critical errors.

## 🔐 Authentication Tests

### Test 1: User Sign-Up

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3001`
3. Click "Sign Up"
4. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "SecurePassword123"
5. Submit form

Expected:

- Account created successfully
- Redirected to dashboard
- Cookie `doltsite-token` set
- Account data stored in Redis

**Verify in Redis**:

```bash
curl -X GET https://your-redis.upstash.io/get/account_email:test@example.com \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: User Login

1. Logout (if logged in)
2. Click "Login"
3. Enter:
   - Email: "test@example.com"
   - Password: "SecurePassword123"
4. Submit

Expected:

- Login successful
- Redirected to dashboard
- JWT token issued
- Session persists on refresh

### Test 3: Invalid Credentials

1. Try login with:
   - Correct email, wrong password
   - Non-existent email

Expected:

- Error message displayed
- No account created/modified

### Test 4: Email Validation

1. Try sign-up with invalid emails:
   - "notanemail"
   - "test@"
   - "@example.com"

Expected:

- Validation error displayed
- Account not created

### Test 5: Logout

1. While logged in, click "Logout"

Expected:

- Session cleared
- Redirected to home page
- Cookie removed

## 📊 Usage Tracking Tests

### Test 6: Check Usage API

1. Sign up as free tier user
2. Make request:

```bash
curl http://localhost:3001/api/usage \
  -H "Cookie: doltsite-token=YOUR_JWT_TOKEN"
```

Expected response:

```json
{
  "tier": "free",
  "usage": 0,
  "remaining": 5,
  "dailyUsage": 0,
  "limit": 5
}
```

### Test 7: Free Tier Limit (5 generations)

1. Generate 5 websites (or simulate with database updates)
2. Try to generate 6th website

Expected:

- First 5 succeed with message
- 6th returns error: "Limit reached for this tier"

### Test 8: Basic Tier Daily Reset

1. Upgrade to Basic tier
2. Generate 10 websites on Day 1

Expected:

- All 10 succeed
- `dailyUsage` = 10

3. Next day (simulate by changing date or waiting):
4. Check usage

Expected:

- `dailyUsage` = 0
- Can generate 10 more

## 🤖 Website Generation Tests

### Test 9: Basic Generation

1. Logged in as any tier user with remaining generations
2. Click "Generate Website"
3. Enter prompt: "Create a simple landing page for a coffee shop"
4. Submit

Expected:

- Loading indicator appears
- HTML/CSS/JS generated
- Preview shows website
- Usage incremented by 1

### Test 10: Generation Error Handling

1. Disable OpenAI API key (set invalid value in env)
2. Try to generate website

Expected:

- Error message: "Failed to generate website"
- Usage NOT incremented

### Test 11: Unauthorized Generation

1. Logout (or delete JWT token from cookie)
2. Try to access `/api/generate` directly

Expected:

- 401 Unauthorized error
- No website generated

## 💳 Payment & Upgrade Tests

### Test 12: Tier Upgrade Endpoint

1. Logged in as free user
2. Make request:

```bash
curl -X POST http://localhost:3001/api/upgrade \
  -H "Cookie: doltsite-token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier": "basic"}'
```

Expected:

- Account tier updated to "basic"
- Subscription timestamp set
- Usage limits adjusted

### Test 13: Upgrade UI

1. As free user, click "Upgrade"
2. Select "Basic Plan" ($9.99/month)
3. Complete payment flow

Expected:

- Payment processed
- Tier upgraded
- Dashboard updated with new limits

### Test 14: Expired Subscription

1. Upgrade to a tier with expiration
2. Simulate expiration (change expires date in Redis to past date)
3. Try to generate website

Expected:

- Error: "Your subscription has expired"
- Redirected to upgrade page

## 🔐 Admin Dashboard Tests

### Test 15: Admin Access

1. Navigate to `/admin`
2. Enter password: `doltsite-admin-2025` (or your custom `ADMIN_PASSWORD`)

Expected:

- Dashboard loads
- Shows list of all users
- Shows system statistics

### Test 16: Admin Unauthorized

1. Navigate to `/admin`
2. Enter wrong password

Expected:

- Error message
- Denied access

### Test 17: View User Statistics

1. In admin dashboard
2. Look for user statistics

Expected:

- Total users displayed
- Free/Basic/Standard/Premium tier counts
- Total API calls
- System health status

## 🗄️ Redis Persistence Tests

### Test 18: Data Persistence After Restart

1. Sign up as user: "persistence@test.com"
2. Generate 1 website (usage should be 1)
3. Stop dev server: `Ctrl+C`
4. Start again: `npm run dev`
5. Login as "persistence@test.com"

Expected:

- User account still exists
- Usage = 1 (not reset)
- All data persists

### Test 19: Verify Redis Operations

```bash
# List all accounts
curl -X GET https://your-redis.upstash.io/scan/0?match=account:* \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific account
curl -X GET https://your-redis.upstash.io/get/account:acc-1234567890 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected:

- Valid JSON responses
- All created accounts visible

## 🌐 Vercel Production Tests

### Test 20: Pre-Deployment Verification

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

Expected:

- Build completes without errors
- Server starts on port 3000
- Can access http://localhost:3000

### Test 21: Production Build Size

After `npm run build`:

```
├ Server  Next.js server-side code
├ Lambda  Serverless functions
├ Static  Optimized assets
└ Image   Image optimization
```

Expected:

- No errors in output
- All routes compiled
- File sizes reasonable

### Test 22: Environment Variable Validation

In Vercel, ensure all vars are set:

```bash
# In Vercel logs, should see:
✓ Using environment variables: JWT_SECRET, OPENAI_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
```

## 🧪 API Endpoint Tests

### Complete API Test Script

```bash
# 1. Sign up
SIGNUP=$(curl -s -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "TestPassword123",
    "name": "API Test User"
  }')

TOKEN=$(echo $SIGNUP | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 2. Get current user
curl -s -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: doltsite-token=$TOKEN" | jq

# 3. Check usage
curl -s -X GET http://localhost:3001/api/usage \
  -H "Cookie: doltsite-token=$TOKEN" | jq

# 4. Generate website
curl -s -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: doltsite-token=$TOKEN" \
  -d '{
    "prompt": "Create a landing page for a tech startup",
    "style": "modern"
  }' | jq '.html' | head -20

# 5. Check usage again (should increment)
curl -s -X GET http://localhost:3001/api/usage \
  -H "Cookie: doltsite-token=$TOKEN" | jq
```

## 📋 Pre-Production Checklist

### Security

- [ ] No secrets in GitHub (`.env.local` in `.gitignore`)
- [ ] All API keys valid and have sufficient credentials
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Admin password is custom and strong
- [ ] Passwords are bcrypt-hashed

### Performance

- [ ] `npm run build` completes in < 30 seconds
- [ ] Production bundle size < 5MB
- [ ] No console errors in production
- [ ] Redis connections working properly

### Functionality

- [ ] Sign-up, login, logout working
- [ ] Usage tracking accurate
- [ ] Website generation working
- [ ] Tier limits enforced
- [ ] Admin dashboard accessible
- [ ] Data persists after restart

### Deployment

- [ ] All Vercel env vars set
- [ ] GitHub repo connected to Vercel
- [ ] `.env.local` NOT in git history
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes

### Monitoring

- [ ] Vercel deployment successful
- [ ] Redis connection established
- [ ] OpenAI API responding
- [ ] Error logs accessible
- [ ] Performance metrics tracking

## 🐛 Debugging Tips

### Check Redis Connection

```bash
# Test Redis in Node
node -e "
const { Redis } = require('@upstash/redis');
const r = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});
r.get('test').then(console.log).catch(console.error);
"
```

### Check OpenAI API

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### View Vercel Logs

```bash
# Install Vercel CLI
npm install -g vercel

# View logs
vercel logs --follow
```

### Check Browser Console

1. Open Developer Tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application → Cookies for JWT token

## ✅ Sign-Off Checklist

Once all tests pass:

- [ ] Local build: ✓
- [ ] Local tests: ✓
- [ ] Redis persistence: ✓
- [ ] API endpoints: ✓
- [ ] Production build: ✓
- [ ] Vercel deployment: ✓
- [ ] Production tests: ✓

**Ready for production: YES / NO**

---

For issues, check:

1. `.env.local` is correct
2. Upstash Redis is running
3. OpenAI API has credits
4. Vercel env vars are set
5. Browser console for errors
