# 🚀 CRITICAL: PostgreSQL Migration Implementation Checklist

**⚠️ DO NOT LAUNCH WITHOUT COMPLETING THIS**

This migration is essential because the current Redis-only system **will lose user data**.

---

## 📋 Quick Setup (15 minutes)

### Step 1: Database Setup
- [ ] Create Supabase account (https://supabase.com) OR Neon (https://neon.tech)
- [ ] Create new PostgreSQL database
- [ ] Copy connection string (`DATABASE_URL`)
- [ ] Add to `.env.local`: `DATABASE_URL=postgresql://...`

### Step 2: Initialize Prisma
```bash
# Run locally
npx prisma generate
npx prisma db push
```
- [ ] Prisma tables created in database

### Step 3: Update API Routes (30 minutes)

**File: `app/api/auth/signup.ts`**
```typescript
// Change this:
import { createAccount } from '@/lib/accounts'

// To this:
import { createAccount } from '@/lib/accounts-db'
```

**File: `app/api/auth/login.ts`**
```typescript
// Change this:
import { findAccountByEmail, verifyPassword } from '@/lib/accounts'

// To this:
import { findAccountByEmail, verifyPassword } from '@/lib/accounts-db'
```

**File: `app/api/auth/me.ts`**
```typescript
// Change this:
import { findAccountById } from '@/lib/accounts'

// To this:
import { findAccountById } from '@/lib/accounts-db'
```

**File: `app/api/generate.ts`**
```typescript
// Change this:
import { canAccountGenerate, incrementUsage } from '@/lib/accounts'

// To this:
import { canAccountGenerate, incrementUsage } from '@/lib/accounts-db'
```

**File: `app/api/upgrade.ts`**
```typescript
// Change this:
import { findAccountById, saveAccount } from '@/lib/accounts'

// To this:
import { findAccountById, saveAccount } from '@/lib/accounts-db'
// Plus: Create Payment records in database
```

**File: `app/api/payment/approve.ts`**
```typescript
// Change this:
import { savePayment } from '@/lib/payments'

// To this:
import { prisma } from '@/lib/db'
// Use: await prisma.payment.create(...)
```

- [ ] All imports updated
- [ ] All functions call new database service
- [ ] Payment records saved to database

### Step 4: Test Locally
```bash
npm run build
npm run start
```

- [ ] Signup works (user created in PostgreSQL)
- [ ] Login works (user retrieved from PostgreSQL)
- [ ] Generation works (usage updated in database)
- [ ] Payments work (payment records created)

- [ ] Check Supabase/Neon dashboard - data visible ✅

### Step 5: Deploy to Vercel

1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add: `DATABASE_URL=your_connection_string`
4. Redeploy or push code to trigger redeploy

- [ ] Deployment successful
- [ ] Test signup/login on live site
- [ ] Test generation on live site
- [ ] Test payments on live site

---

## ✅ Verification

After deployment, verify:

```bash
# Signup
curl -X POST https://your-app.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Test","password":"pass123"}'
# Expected: 201 with account data ✅

# Login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
# Expected: 200 with JWT token ✅

# Check user in database
# Login to Supabase/Neon → Look at 'accounts' table
# Should see your test user ✅
```

---

## 🔄 Rollback Plan (if needed)

If anything breaks:
1. Old `lib/accounts.ts` still exists (Redis version)
2. Revert imports back to old library
3. Delete Prisma migration (optional)
4. Redeploy

---

## 📊 Current Status

| Item | Status |
|------|--------|
| Prisma setup | ✅ Done |
| Schema created | ✅ Done |
| New DB service | ✅ Done |
| Migration guide | ✅ Done |
| **API routes** | ⏳ TODO |
| **Database setup** | ⏳ TODO |
| **Local testing** | ⏳ TODO |
| **Vercel deploy** | ⏳ TODO |

---

## ⚠️ Critical Notes

1. **This is NOT optional** - Current system will lose user data
2. **Timeline:** 1-2 hours total implementation
3. **Testing:** Test thoroughly before going live
4. **Backups:** Supabase/Neon have automatic backups
5. **Free tier:** Enough for thousands of users

---

## 🆘 Help

If you get stuck:
1. Check `POSTGRES_MIGRATION_GUIDE.md` for detailed steps
2. Check Supabase/Neon docs for connection string format
3. Run `npx prisma migrate status` to check migration status
4. Run `npx prisma studio` to view database with GUI

---

**Status: ⏳ AWAITING IMPLEMENTATION**  
**Urgency: 🔴 CRITICAL - Must complete before production launch**  
**Estimated Time: 1-2 hours**

Let me know when you're ready to start! 🚀
