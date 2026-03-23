# 🔥 Integration Guide: Using the Controlled Generation Pipeline

## Quick Start

The controlled generation pipeline is in `lib/generation-service.ts`. It provides one main function:

```typescript
generateWebsiteControlled(
  accountId: string,
  prompt: string,
  generatorFn: (prompt: string) => { html: string; template: string },
  requestId?: string
): Promise<GenerationResult>
```

---

## How to Use in `/api/generate`

### Current Code (Unsafe ❌)
```typescript
export async function POST(request: NextRequest) {
  const { description } = await request.json()
  const token = request.cookies.get('doltsite-token')?.value
  const accountId = await verifyJWT(token)
  const account = await findAccountById(accountId)
  
  // NO LOCK!
  // NO VALIDATION!
  const html = generateTemplates[detectTemplate(description)](description)
  
  // AI might fail, but we already started!
  await incrementUsage(account)
  
  return NextResponse.json({ success: true, html })
}
```

**Problems:**
- ❌ No concurrency control
- ❌ No validation before AI call
- ❌ Unsafe incrementing
- ❌ No timeout protection
- ❌ No error recovery

---

### New Code (Safe ✅)
```typescript
import { generateWebsiteControlled } from '@/lib/generation-service'
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, findAccountById } from '@/lib/accounts-db'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()
    
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
    }

    // ── Get account from token ────────────────────────────────────────────
    const token = request.cookies.get('doltsite-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const accountId = await verifyJWT(token)
    if (!accountId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // ── Call controlled generation pipeline ────────────────────────────────
    // This handles EVERYTHING:
    // - Lock acquisition
    // - Validation
    // - AI execution with timeout
    // - DB update
    // - Lock release
    // - Error handling
    const result = await generateWebsiteControlled(
      accountId,
      description,
      (prompt) => {
        // This function is isolated - no DB calls
        const template = detectTemplate(prompt)
        const html = generateTemplates[template](prompt)
        return { html, template }
      },
      `req-${Date.now()}` // requestId for idempotency
    )

    // ── Return result ─────────────────────────────────────────────────────
    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Generation failed',
          message: result.message 
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      html: result.html,
      template: result.template,
      message: result.message,
      usage: result.usage,
      tier: result.tier,
    })

  } catch (error) {
    console.error('Generate endpoint error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**What's Guaranteed:**
- ✅ Only one generation per user at a time
- ✅ Limits are always checked before AI call
- ✅ No double credits deducted
- ✅ AI call is isolated (no side effects)
- ✅ Lock always released
- ✅ Timeout protection (15s max)
- ✅ Atomic database updates

---

## Understanding the Pipeline Flow

### Success Case
```
1. User sends prompt
2. LOCK acquired (isGenerating = true)
3. VALIDATE ✅ (credits available)
4. EXECUTE AI → HTML generated
5. UPDATE DB ✅ (credits decremented, generation logged)
6. RELEASE LOCK (isGenerating = false)
7. Return { success: true, html }
```

### Limit Reached Case
```
1. User sends prompt
2. LOCK acquired (isGenerating = true)
3. VALIDATE ❌ (generationsUsed >= limit)
4. Return error message
5. RELEASE LOCK (isGenerating = false)
6. No AI call, no DB changes
```

### AI Failure Case
```
1. User sends prompt
2. LOCK acquired (isGenerating = true)
3. VALIDATE ✅
4. EXECUTE AI → TIMEOUT after 15s
5. No DB update
6. RELEASE LOCK (isGenerating = false)
7. Return error message
```

### DB Update Fails Case
```
1. User sends prompt
2. LOCK acquired (isGenerating = true)
3. VALIDATE ✅
4. EXECUTE AI → HTML generated
5. UPDATE DB ❌ (network error)
6. RELEASE LOCK (isGenerating = false)
7. Return error, but HTML is lost (acceptable)
```

---

## Error Messages

The pipeline returns these errors:

| Error | Meaning | Recovery |
|-------|---------|----------|
| `concurrent_request` | User already generating | Wait for completion |
| `access_denied` | Subscription inactive/expired | Renew subscription |
| `access_denied` | Limit reached | Upgrade to higher tier |
| `generation_failed` | AI timeout or error | Retry after delay |
| `save_failed` | DB update failed | Retry (HTML is cached locally) |
| `pipeline_error` | Unexpected error | Contact support |

---

## Testing the Integration

### Test 1: Normal Generation (Should Work)
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Cookie: doltsite-token=<valid_token>" \
  -H "Content-Type: application/json" \
  -d '{"description":"restaurant website"}' \
  | jq
```

**Expected Response:**
```json
{
  "success": true,
  "html": "<html>...</html>",
  "template": "ecommerce",
  "message": "Website generated successfully",
  "usage": 1,
  "tier": "free"
}
```

### Test 2: Spam Protection (Should Fail)
```bash
# In two terminals, run simultaneously:
curl -X POST http://localhost:3000/api/generate \
  -H "Cookie: doltsite-token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"description":"restaurant"}'

# Second one should get:
{
  "error": "concurrent_request",
  "message": "Already generating. Please wait."
}
```

### Test 3: Limit Exhaustion (Should Fail)
```bash
# First, set user to max:
# UPDATE accounts SET generationsUsed = 3 WHERE tier = 'free';

curl -X POST http://localhost:3000/api/generate \
  -H "Cookie: doltsite-token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"description":"restaurant"}'

# Expected:
{
  "error": "access_denied",
  "message": "Generation limit reached"
}
```

---

## Advanced: Custom Generator Function

You can pass ANY generator function to the pipeline:

```typescript
// Using inline templates
const result = await generateWebsiteControlled(
  accountId,
  prompt,
  (p) => generateTemplates[detectTemplate(p)](p)
)

// Using OpenAI (advanced)
const result = await generateWebsiteControlled(
  accountId,
  prompt,
  async (p) => {
    const openaiResult = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: p }],
    })
    return { html: openaiResult.choices[0].text, template: 'custom' }
  }
)

// Using local ML model
const result = await generateWebsiteControlled(
  accountId,
  prompt,
  (p) => mlModel.generate(p)
)
```

The pipeline doesn't care about the implementation - it only cares about:
1. Input: prompt string
2. Output: { html, template }
3. No side effects during execution

---

## Monitoring & Logging

Add to the pipeline for production:

```typescript
// At the start of generateWebsiteControlled:
console.log(`[GENERATE] Starting for user ${accountId}`)
console.log(`[VALIDATE] Checking limits...`)

// In finally block:
console.log(`[RELEASE] Lock released for user ${accountId}`)
console.log(`[STATS] Time: ${Date.now() - startTime}ms`)
```

---

## Common Mistakes to Avoid

❌ **DON'T:**
```typescript
// Don't call AI before validation
const html = await generateWebsite(prompt)
if (!canGenerate(user)) return
```

❌ **DON'T:**
```typescript
// Don't forget to release lock
if (error) return
```

❌ **DON'T:**
```typescript
// Don't trust frontend to count usage
user.generations_used = frontend_value
```

✅ **DO:**
```typescript
// Use the controlled pipeline - it handles everything
const result = await generateWebsiteControlled(...)
```

---

## Deployment Checklist

- [ ] Update `/api/generate` route to use pipeline
- [ ] Database has `isGenerating` field (already in schema)
- [ ] `lib/generation-service.ts` deployed
- [ ] Build passes: `npm run build`
- [ ] DATABASE_URL set in Vercel environment
- [ ] Test on staging: spam click → should get "Already generating"
- [ ] Test limit: set usage to max → should get limit error
- [ ] Monitor logs: look for lock release times
- [ ] Deploy to production

---

## Summary

**Before Integration:**
```
User → API → (no checks) → AI → DB → Maybe wrong?
```

**After Integration:**
```
User → API → LOCK → CHECK → AI → UPDATE DB → RELEASE ✅
       ↑                                        ↓
       └────────── Clean up on any error ──────┘
```

The pipeline is your safety net. Use it for every generation.
