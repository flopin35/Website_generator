# 🔄 PostgreSQL Migration Guide - FROM Redis TO Permanent Storage

**Status:** Ready to Implement  
**Database:** PostgreSQL (Supabase or Neon)  
**ORM:** Prisma  
**Impact:** User data is now PERMANENT ✅

---

## 🎯 What's Changed

### ❌ OLD Architecture (BROKEN)

```
Redis (in-memory) → Stores users, accounts, passwords
↓
Data disappears if Redis restarts
↓
💀 Users lose their accounts
```

### ✅ NEW Architecture (FIXED)

```
PostgreSQL → Stores users, accounts, passwords (PERMANENT)
↓
Redis → ONLY sessions/caching (temporary)
↓
✅ Users data is safe and persistent
```

---

## 📋 Setup Instructions

### Step 1: Create PostgreSQL Database

**Option A: Supabase (Recommended)**

1. Go to https://supabase.com
2. Click "New Project"
3. Set name, password, region
4. Wait for setup (~2 min)
5. Go to "Settings" → "Database"
6. Copy connection string (URL format)
7. Replace `[YOUR-PASSWORD]` with your actual password

**Option B: Neon**

1. Go to https://neon.tech
2. Click "Create Project"
3. Select PostgreSQL
4. Copy connection string

### Step 2: Set DATABASE_URL

```bash
# In .env.local, add:
DATABASE_URL=postgresql://user:password@host:5432/doltsite
```

**Example from Supabase:**

```
postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres
```

### Step 3: Initialize Prisma

```bash
# Generate Prisma client
npx prisma generate

# Create database tables (migrations)
npx prisma migrate deploy

# Or for first-time setup:
npx prisma db push
```

### Step 4: Update Code

All API routes that use accounts need to be updated to use the new database service:

**Before (Redis):**

```typescript
import { findAccountByEmail, saveAccount } from "@/lib/accounts";
```

**After (PostgreSQL):**

```typescript
import { findAccountByEmail, saveAccount } from "@/lib/accounts-db";
```

---

## 📦 Files Created

1. **`prisma/schema.prisma`** - Database schema definition
2. **`lib/db.ts`** - Prisma client singleton
3. **`lib/accounts-db.ts`** - New account service using PostgreSQL

---

## 🔄 API Routes to Update

These files need to be updated to use the new database service:

- [ ] `app/api/auth/signup.ts` → Use `createAccount()`
- [ ] `app/api/auth/login.ts` → Use `findAccountByEmail()` + `verifyPassword()`
- [ ] `app/api/auth/me.ts` → Use `findAccountById()`
- [ ] `app/api/generate.ts` → Use `canAccountGenerate()` + `incrementUsage()`
- [ ] `app/api/payment/approve.ts` → Create Payment records
- [ ] `app/api/upgrade.ts` → Update Account tier and expiry

---

## ✅ Testing

After setup, test these endpoints:

```bash
# 1. Create account (signup)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Check account
curl http://localhost:3000/api/auth/me

# 4. Generate website
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"description":"A restaurant website"}'
```

---

## 🚀 Benefits

✅ **Data Persistence** - Accounts never disappear  
✅ **Reliability** - PostgreSQL ACID guarantees  
✅ **Scalability** - Handle millions of users  
✅ **Backups** - Native database backups  
✅ **Compliance** - GDPR-compliant data retention  
✅ **Performance** - Indexed queries are fast

---

## 💾 Database Backup

### Supabase

Settings → Backups → Enable daily backups

### Neon

Settings → Backups → Enable automated backups

---

## 🔒 Security

- ✅ Passwords are hashed with bcrypt
- ✅ Database credentials in `.env.local` (not committed)
- ✅ Connection strings use SSL/TLS
- ✅ Prisma prevents SQL injection

---

## 📊 Schema Overview

### `accounts` table

```sql
id (text) - Unique ID
email (text) - Unique email
name (text) - User's name
passwordHash (text) - Hashed password
tier (text) - free|basic|standard|premium
usage (int) - Total usage count
dailyUsage (int) - Today's usage
lastReset (datetime) - When daily counter reset
expires (datetime) - Subscription expiry (null if active)
createdAt (datetime) - Account created
updatedAt (datetime) - Last update
```

### `payments` table

```sql
id (text) - Payment ID
accountId (text) - FK to accounts.id
amount (text) - "20 GHS", "50 GHS", etc
tier (text) - basic|standard|premium
status (text) - pending|completed|failed
reference (text) - Transaction ID
completedAt (datetime) - When payment completed
```

---

## ⚠️ Important Notes

1. **Migration is reversible** - Old Redis data can be migrated if needed
2. **Zero downtime** - Deploy new code gradually
3. **Supabase/Neon free tier** - Enough for most applications
4. **Paid plans** - Scale as users grow

---

## 🎯 Next Steps

1. **Choose database:** Supabase or Neon
2. **Get DATABASE_URL** from your provider
3. **Set .env.local** with DATABASE_URL
4. **Run migrations:** `npx prisma db push`
5. **Update API routes** to use new database service
6. **Test all endpoints** before deploying
7. **Deploy to Vercel** with DATABASE_URL in environment variables

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"

- Check DATABASE_URL is correct
- Ensure database is accessible from Vercel IP
- Supabase: check if database is paused

### Error: "Relations don't exist"

- Run: `npx prisma migrate deploy`
- Or: `npx prisma db push`

### Error: "Unique constraint violation"

- Email already exists
- Handle duplicate email in signup

---

**Status: Ready to Implement** ✅  
**Critical: Do NOT launch without this migration** ⚠️  
**Timeline: ~30 minutes to fully implement and test**
