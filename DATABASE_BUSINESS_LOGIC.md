# 🔥 Database Business Logic Guide

**This is THE most important file for understanding how to prevent cheating and enforce limits.**

---

## ⚠️ CRITICAL RULE

**NEVER trust frontend data for limits.**

Always:

1. Fetch user from database
2. Check their plan/tier
3. Check their usage/limit
4. Block or allow on server

---

## 📊 Database Structure

### Users Table (`accounts`)

```
id               → Unique user ID
email            → Login email
passwordHash     → Bcrypt hashed password
tier             → free | basic | standard | premium
subscriptionStatus → active | expired | cancelled
generationsUsed  → How many sites generated THIS PERIOD
generationsLimit → Max allowed (3, 10, 200, or ∞)
lastResetAt      → When current period started
subscriptionExpiresAt → When subscription ends (null for free)
lastLoginAt      → Last time user logged in
lastGenerationAt → Last time user generated a website
createdAt        → Account created timestamp
```

### Generations Table (`generations`)

```
id               → Unique generation ID
accountId        → Which user generated this
description      → User's prompt
htmlOutput       → Generated HTML (for redownload)
generatedAt      → When generated (for period reset logic)
countedTowardLimit → true (counted) or false (demo/free)
```

### Payments Table (`payments`)

```
id               → Unique payment ID
accountId        → Which user paid
amount           → "20 GHS", "50 GHS", etc.
tier             → basic | standard | premium
status           → pending | completed | failed
reference        → MoMo transaction ID
completedAt      → When payment was approved
```

---

## 🎯 Generation Limits Logic

### Free Tier

- **Limit:** 3 generations per day
- **Reset:** Daily (every 24 hours at first generation of day)
- **Enforcement:**
  ```javascript
  // When user tries to generate:
  1. Fetch user from database
  2. Check: generationsUsed >= generationsLimit (3)?
  3. If YES → Block, show "upgrade" button
  4. If NO → Allow, increment generationsUsed
  5. Log in generations table
  ```

### Basic Tier (20 GHS/month)

- **Limit:** 10 generations per day
- **Reset:** Daily
- **Check:** Same as free, but generationsLimit = 10

### Standard Tier (50 GHS/month)

- **Limit:** 200 generations per month
- **Reset:** Monthly (on subscription renewal date)
- **Enforcement:**
  ```javascript
  // When user tries to generate:
  1. Fetch user from database
  2. Check: generationsUsed >= generationsLimit (200)?
  3. If YES → Block, show "upgrade" button
  4. If NO → Allow, increment generationsUsed
  5. Check if subscriptionExpiresAt is in past
  6. If expired → show "renew subscription" button
  ```

### Premium Tier (250 GHS/month)

- **Limit:** Unlimited
- **Enforcement:**
  ```javascript
  // Always allow, just log the generation
  1. Check subscriptionExpiresAt not in past
  2. If expired → block, show "renew subscription"
  3. If active → allow unlimited generations
  ```

---

## 🚀 Implementation Examples

### Example 1: Checking if user can generate (SERVER SIDE)

**File: `app/api/generate.ts`**

```typescript
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { accountId, description } = await req.json();

  // 🔥 NEVER trust frontend
  // Always fetch from database
  const user = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // 💀 Check subscription validity
  if (user.subscriptionStatus === "expired") {
    return Response.json(
      {
        error: "subscription_expired",
        message: "Please renew your subscription",
      },
      { status: 403 },
    );
  }

  // 💀 Check generation limit
  if (user.generationsUsed >= user.generationsLimit) {
    return Response.json(
      {
        error: "limit_exceeded",
        message: `You've reached your ${user.generationsLimit} generation limit`,
        limit: user.generationsLimit,
        used: user.generationsUsed,
      },
      { status: 403 },
    );
  }

  // ✅ User can generate
  // Generate the website
  const html = await generateWebsite(description);

  // ✅ Update database IMMEDIATELY
  const updated = await prisma.account.update({
    where: { id: accountId },
    data: {
      generationsUsed: user.generationsUsed + 1,
      lastGenerationAt: new Date(),
    },
  });

  // ✅ Log generation for audit trail
  await prisma.generation.create({
    data: {
      accountId: accountId,
      description: description,
      htmlOutput: html,
      countedTowardLimit: true,
    },
  });

  return Response.json({
    html,
    remaining: user.generationsLimit - (user.generationsUsed + 1),
    tier: user.tier,
  });
}
```

---

### Example 2: Resetting daily limit (SCHEDULED JOB)

**What you need:** A cron job that runs every day at midnight

```typescript
// File: app/api/cron/reset-daily-limits.ts
// Called by external cron service (e.g., EasyCron, Vercel Crons)

import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  // Reset daily limits for free and basic tier users
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await prisma.account.updateMany({
    where: {
      tier: { in: ["free", "basic"] },
      lastResetAt: { lt: yesterday },
    },
    data: {
      generationsUsed: 0,
      lastResetAt: new Date(),
    },
  });

  return Response.json({ success: true });
}
```

---

### Example 3: Resetting monthly limit (WHEN SUBSCRIPTION RENEWS)

```typescript
// File: app/api/payment/approve.ts
// Called when payment is approved

import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { accountId, paymentId, momoReference } = await req.json();

  // ✅ Update payment status
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "completed",
      reference: momoReference,
      completedAt: new Date(),
    },
  });

  // ✅ Update user subscription
  const newExpiryDate = new Date();
  newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);

  await prisma.account.update({
    where: { id: accountId },
    data: {
      tier: payment.tier,
      subscriptionStatus: "active",
      subscriptionExpiresAt: newExpiryDate,
      generationsUsed: 0, // Reset for new month
      generationsLimit: getTierLimit(payment.tier),
      lastResetAt: new Date(), // Mark reset time
    },
  });

  return Response.json({ success: true });
}

function getTierLimit(tier: string): number {
  switch (tier) {
    case "free":
      return 3;
    case "basic":
      return 10;
    case "standard":
      return 200;
    case "premium":
      return Infinity;
    default:
      return 0;
  }
}
```

---

## 💀 Common Mistakes (DON'T DO THESE)

### ❌ Mistake 1: Track usage in localStorage

```javascript
// WRONG ❌
const usage = localStorage.getItem("generationsUsed");
if (usage >= 3) {
  block();
} else {
  allow();
}

// Why it fails:
// - User refreshes page → count resets
// - User opens private browser → count resets
// - User clears cache → count resets
// - User cheats by editing localStorage
```

### ❌ Mistake 2: Trust frontend for limit checking

```javascript
// WRONG ❌
// Frontend sends: { accountId, canGenerate: true }
// Backend trusts it and generates

// Why it fails:
// - User modifies network request
// - User creates fake JWT
// - User spoofs accountId
```

### ❌ Mistake 3: Don't reset limits

```javascript
// WRONG ❌
// User hits limit: generationsUsed = 3
// Never reset, so user is blocked forever

// Why it fails:
// - Users can't use free tier next day
// - Subscription renewals are broken
```

### ❌ Mistake 4: Store everything in Redis (original problem)

```javascript
// WRONG ❌
// User registered → stored in Redis only
// Server restarts → user data vanished

// Why it fails:
// - Redis is in-memory (temporary)
// - On reboot/crash, all data lost
// - Users can't log back in
```

---

## ✅ Correct Implementation

1. **Database is SOURCE OF TRUTH**
   - Always fetch user from PostgreSQL
   - Never trust frontend values

2. **Check limits on server**
   - User sends request to generate
   - Server fetches user from DB
   - Server checks: generationsUsed < generationsLimit?
   - Server allows or blocks

3. **Update database immediately**
   - After generation succeeds
   - Increment generationsUsed
   - Log in generations table
   - Return remaining count to frontend

4. **Schedule resets**
   - Daily reset for free/basic (cron job)
   - Monthly reset for standard/premium (on subscription renewal)

---

## 📊 Database Queries You'll Need

### Get user's remaining generations

```sql
SELECT
  generationsLimit - generationsUsed as remaining,
  tier,
  subscriptionStatus
FROM accounts
WHERE id = $1;
```

### Check if user can generate

```sql
SELECT
  CASE
    WHEN subscriptionStatus = 'expired' THEN 'subscription_expired'
    WHEN generationsUsed >= generationsLimit THEN 'limit_exceeded'
    ELSE 'allowed'
  END as status
FROM accounts
WHERE id = $1;
```

### Count generations for user this month

```sql
SELECT COUNT(*) as count
FROM generations
WHERE accountId = $1
  AND generatedAt > NOW() - INTERVAL '30 days';
```

---

## 🎯 Why This Matters

With this system:

- ✅ **Fair pricing** - Users can't cheat the limits
- ✅ **Revenue protection** - Free users become paid users
- ✅ **Reliable** - Data persists in PostgreSQL
- ✅ **Scalable** - Works for 1 user or 1 million users
- ✅ **Compliant** - Full audit trail of all actions
- ✅ **Transparent** - Users see exactly what they get

---

## 🚀 Next Steps

1. Implement all API endpoints following this pattern
2. Set up daily cron job for limit resets
3. Test thoroughly:
   - Generate until limit
   - Try to bypass limits
   - Check database directly
   - Verify limits reset correctly
4. Deploy with confidence

---

**Remember:** The database is your business logic. Protect it. Trust it. Never bypass it.
