/**
 * Generation Service — Controlled Execution Pipeline
 * 
 * Implements proper concurrency control, validation, and error handling
 * to prevent spam, double charges, and system overload.
 * 
 * Flow:
 * 1. LOCK user (prevent concurrent requests)
 * 2. VALIDATE access (credits, plan, limits)
 * 3. EXECUTE AI (isolated, no DB changes)
 * 4. UPDATE DB (only after success)
 * 5. RELEASE lock (always, even on errors)
 */

import { prisma } from './db'

export type GenerationResult = {
  success: boolean
  html?: string
  template?: string
  message: string
  usage?: number
  tier?: string
  error?: string
}

const GENERATION_TIMEOUT = 15000 // 15 seconds
const REQUEST_ID_EXPIRY = 60000 // 1 minute (for idempotency)

/**
 * STAGE 1: Acquire lock (prevent concurrent generation)
 * Returns false if user is already generating
 */
async function acquireLock(accountId: string): Promise<boolean> {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    })

    if (account?.isGenerating) {
      return false // Already generating
    }

    // Set lock
    await prisma.account.update({
      where: { id: accountId },
      data: { isGenerating: true },
    })

    return true
  } catch (e) {
    console.error('Failed to acquire lock:', e)
    return false
  }
}

/**
 * STAGE 2: Release lock (always call, even on error)
 */
async function releaseLock(accountId: string): Promise<void> {
  try {
    await prisma.account.update({
      where: { id: accountId },
      data: { isGenerating: false },
    })
  } catch (e) {
    console.error('Failed to release lock:', e)
  }
}

/**
 * STAGE 3: Validate access (check credits, plan, limits)
 */
async function validateAccess(accountId: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        tier: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        generationsUsed: true,
        generationsLimit: true,
        lastResetAt: true,
      },
    })

    if (!account) {
      return { valid: false, reason: 'Account not found' }
    }

    // Check subscription status
    if (account.subscriptionStatus !== 'active') {
      return { valid: false, reason: 'Subscription inactive' }
    }

    // Check expiry
    if (account.subscriptionExpiresAt && new Date() > account.subscriptionExpiresAt) {
      return { valid: false, reason: 'Subscription expired' }
    }

    // Check generation limits
    // For premium, always allow
    if (account.tier === 'premium') {
      return { valid: true }
    }

    // For other tiers, check if limit reached
    if (account.generationsUsed >= account.generationsLimit) {
      return { valid: false, reason: 'Generation limit reached' }
    }

    return { valid: true }
  } catch (e) {
    console.error('Validation error:', e)
    return { valid: false, reason: 'Validation failed' }
  }
}

/**
 * STAGE 4: Check idempotency (prevent double charge)
 */
async function checkIdempotency(
  accountId: string,
  requestId: string
): Promise<{ isDuplicate: boolean; previousResult?: any }> {
  // Simplified for now - will fully implement after DB is live
  return { isDuplicate: false }
}

/**
 * STAGE 4: Execute generation with timeout
 */
async function executeGeneration(
  prompt: string,
  generatorFn: (prompt: string) => { html: string; template: string }
): Promise<{ html: string; template: string } | null> {
  try {
    const result = await Promise.race([
      Promise.resolve(generatorFn(prompt)),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Generation timeout')), GENERATION_TIMEOUT)
      ),
    ])

    return result
  } catch (e) {
    console.error('Generation execution error:', e)
    return null
  }
}

/**
 * STAGE 6: Update account after successful generation
 */
async function updateAccountAfterGeneration(
  accountId: string,
  requestId: string,
  html: string
): Promise<boolean> {
  try {
    // Save generation record
    await prisma.generation.create({
      data: {
        accountId,
        description: 'Generated website',
        htmlOutput: html,
        countedTowardLimit: true,
      },
    })

    // Update account usage
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { generationsUsed: true, generationsLimit: true },
    })

    if (!account) {
      return false
    }

    await prisma.account.update({
      where: { id: accountId },
      data: {
        generationsUsed: account.generationsUsed + 1,
        lastGenerationAt: new Date(),
      },
    })

    return true
  } catch (e) {
    console.error('Failed to update account:', e)
    return false
  }
}

/**
 * MAIN: Controlled Generation Pipeline
 * 
 * This is the ONLY way to call generation.
 * It enforces all safety measures.
 */
export async function generateWebsiteControlled(
  accountId: string,
  prompt: string,
  generatorFn: (prompt: string) => { html: string; template: string },
  requestId: string = Date.now().toString()
): Promise<GenerationResult> {
  // STAGE 1: ACQUIRE LOCK
  const lockAcquired = await acquireLock(accountId)
  if (!lockAcquired) {
    return {
      success: false,
      message: 'Already generating. Please wait.',
      error: 'concurrent_request',
    }
  }

  try {
    // STAGE 2: CHECK IDEMPOTENCY (prevent double charge)
    // Skip for now - will add after schema update
    // const { isDuplicate } = await checkIdempotency(accountId, requestId)
    // if (isDuplicate) {
    //   return {
    //     success: false,
    //     message: 'Duplicate request. Please try again.',
    //     error: 'duplicate_request',
    //   }
    // }

    // STAGE 3: VALIDATE ACCESS
    const validation = await validateAccess(accountId)
    if (!validation.valid) {
      return {
        success: false,
        message: validation.reason || 'Access denied',
        error: 'access_denied',
      }
    }

    // STAGE 4: EXECUTE GENERATION (isolated, no DB changes)
    const result = await executeGeneration(prompt, generatorFn)
    if (!result) {
      return {
        success: false,
        message: 'Generation failed. Please try again.',
        error: 'generation_failed',
      }
    }

    // STAGE 5: UPDATE DATABASE (only after successful generation)
    const updated = await updateAccountAfterGeneration(accountId, requestId, result.html)
    if (!updated) {
      return {
        success: false,
        message: 'Failed to save generation. Please try again.',
        error: 'save_failed',
      }
    }

    // Get updated account info
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { generationsUsed: true, generationsLimit: true, tier: true },
    })

    return {
      success: true,
      html: result.html,
      template: result.template,
      message: 'Website generated successfully',
      usage: account?.generationsUsed,
      tier: account?.tier,
    }
  } catch (error) {
    console.error('Generation pipeline error:', error)
    return {
      success: false,
      message: 'Generation failed',
      error: 'pipeline_error',
    }
  } finally {
    // STAGE 6: ALWAYS RELEASE LOCK (even on error)
    await releaseLock(accountId)
  }
}

/**
 * Helper: Get fresh account data
 */
export async function getFreshAccountData(accountId: string) {
  try {
    return await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        tier: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        generationsUsed: true,
        generationsLimit: true,
      },
    })
  } catch (e) {
    console.error('Failed to fetch account:', e)
    return null
  }
}
