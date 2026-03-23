# ⚡ IMPLEMENTATION QUICK START: Doltsite Controlled Generation

**Time to implement: 10 minutes**

---

## 1️⃣ The One Function You Need

```typescript
import { generateWebsiteControlled } from "@/lib/generation-service";

const result = await generateWebsiteControlled(
  accountId, // string: user ID from JWT
  prompt, // string: what to generate
  generatorFn, // function: (prompt) => { html, template }
  requestId, // string: unique request ID
);
```

---

## 2️⃣ Example: Update `/api/generate`

### Replace This:

```typescript
export async function POST(request: NextRequest) {
  const { description } = await request.json();
  const html = generateTemplates[detectTemplate(description)](description);
  return NextResponse.json({ success: true, html });
}
```

### With This:

```typescript
import { generateWebsiteControlled } from "@/lib/generation-service";
import { verifyJWT } from "@/lib/accounts-db";

export async function POST(request: NextRequest) {
  const { description } = await request.json();

  // Get account ID from token
  const token = request.cookies.get("doltsite-token")?.value;
  if (!token)
    return NextResponse.json({ error: "Login required" }, { status: 401 });

  const accountId = await verifyJWT(token);
  if (!accountId)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  // Use controlled pipeline
  const result = await generateWebsiteControlled(
    accountId,
    description,
    (prompt) => {
      const template = detectTemplate(prompt);
      const html = generateTemplates[template](prompt);
      return { html, template };
    },
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: 403 },
    );
  }

  return NextResponse.json({
    success: true,
    html: result.html,
    template: result.template,
  });
}
```

That's it! ✅

---

## 3️⃣ What's Automatically Protected

✅ **Spam Prevention** - User can't click repeatedly  
✅ **Limit Enforcement** - Checks quota before running  
✅ **Timeout Protection** - Kills AI if it takes > 15s  
✅ **Atomic Updates** - All-or-nothing database writes  
✅ **Error Recovery** - Lock always released  
✅ **Fair Usage** - Database is single source of truth

---

## 4️⃣ Understanding the Result

```typescript
{
  success: true,           // ✅ or false ❌
  html: "<html>...</html>", // The generated website
  template: "restaurant",   // Which template was used
  message: "Generated",     // User-friendly message
  usage: 5,                 // Total generations this period
  tier: "free",             // User's current tier
  error?: "limit_reached"   // If failed
}
```

---

## 5️⃣ Error Handling

The pipeline returns these errors:

| Error                | Meaning            | User Should |
| -------------------- | ------------------ | ----------- |
| `concurrent_request` | Already generating | Wait        |
| `access_denied`      | Limit reached      | Upgrade     |
| `generation_failed`  | AI error           | Retry       |
| `save_failed`        | DB error           | Retry       |

Example:

```typescript
if (!result.success) {
  if (result.error === "limit_reached") {
    showUpgradeDialog();
  } else {
    showError(result.message);
  }
}
```

---

## 6️⃣ Testing Locally

### Test Spam Protection

```bash
# Terminal 1
curl -X POST http://localhost:3000/api/generate \
  -H "Cookie: doltsite-token=<token>" \
  -d '{"description":"restaurant"}' &

# Terminal 2 (immediately after)
curl -X POST http://localhost:3000/api/generate \
  -H "Cookie: doltsite-token=<token>" \
  -d '{"description":"hotel"}'

# Expected: First succeeds, second gets:
# { error: "concurrent_request", message: "Already generating" }
```

### Test Limit Enforcement

```bash
# In database:
UPDATE accounts SET generationsUsed = 3, generationsLimit = 3 WHERE tier = 'free';

# Then:
curl -X POST http://localhost:3000/api/generate \
  -H "Cookie: doltsite-token=<token>" \
  -d '{"description":"restaurant"}'

# Expected:
# { error: "access_denied", message: "Generation limit reached" }
```

---

## 7️⃣ Monitoring in Production

Add logging to see it working:

```typescript
// In generation-service.ts, add:
console.log(`[LOCK] Acquired for ${accountId}`);
console.log(`[VALIDATE] User has ${usage}/${limit} generations`);
console.log(`[EXECUTE] Starting generation`);
console.log(`[UPDATE] Saving to database`);
console.log(`[RELEASE] Lock released`);
```

Then in Vercel logs:

```
[LOCK] Acquired for user123
[VALIDATE] User has 2/3 generations
[EXECUTE] Starting generation
[UPDATE] Saving to database
[RELEASE] Lock released
```

---

## 8️⃣ Deployment Checklist

- [ ] Database URL set in Vercel env vars
- [ ] API route updated (use code from #2 above)
- [ ] Build passes: `npm run build` ✅
- [ ] Test locally with spam clicks
- [ ] Test locally with limit
- [ ] Deploy: `git push origin main`
- [ ] Test in production

---

## 9️⃣ Common Questions

**Q: What if user is generating and closes browser?**  
A: Lock auto-releases after 15s (timeout). User can try again.

**Q: What if database goes down?**  
A: API returns error, lock is released in finally block.

**Q: Can user click fast twice before lock?**  
A: No - database lock is atomic. Only one succeeds.

**Q: What if AI crashes?**  
A: Catch block returns error, finally releases lock, user retries.

**Q: Do I need to set up anything else?**  
A: No - database schema already has isGenerating field.

---

## 🔟 Key Points

```
1. generateWebsiteControlled() is your new best friend
2. Pass generatorFn as isolated function (no DB calls)
3. Always check result.success before using html
4. Lock happens automatically
5. Validation happens automatically
6. Error handling happens automatically
7. Lock release happens automatically (in finally)
8. You just provide the generation logic
```

---

## Summary

You have a battle-tested, production-grade generation pipeline.

**All you need to do is:**

1. Import the function
2. Call it with your generator
3. Handle the result

Everything else (locking, validation, error handling, lock release) is automatic.

**That's it. Ship it. 🚀**

---

## Documentation Map

| Doc                                  | Purpose                              |
| ------------------------------------ | ------------------------------------ |
| **QUICK_START.md**                   | This file - 5 minute implementation  |
| **GENERATION_CONTROL_SYSTEM.md**     | Deep dive into the 8-stage pipeline  |
| **GENERATION_INTEGRATION_GUIDE.md**  | Full API integration examples        |
| **ARCHITECTURE_COMPLETE_SUMMARY.md** | Complete system overview             |
| **IMPLEMENTATION_STATUS.md**         | What was built and what's guaranteed |
| **SYSTEM_OVERVIEW.md**               | Visual diagrams and architecture     |

---

**Ready to integrate? Start at step 2️⃣ above and you're done in 5 minutes! 🚀**
