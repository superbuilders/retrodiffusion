import { z } from 'zod'

export const ClientConfigSchema = z.object({
    apiKey: z.string().min(1, 'API key is required').optional(),
    baseUrl: z.string().url().optional(),
    timeout: z.number().positive().optional(),
    retries: z.number().min(0).max(5).optional(),
})

export const ApiResponseSchema = z
    .object({
        created_at: z.number(),
        credit_cost: z.number(),
        remaining_credits: z.number(),
    })
    .passthrough() // Allow additional properties

export const CreditsResponseSchema = z.object({
    credits: z.number(),
})

export const base64Schema = z
    .string()
    .min(1, 'Base64 string cannot be empty')
    .refine(val => !val.startsWith('data:'), 'Base64 string should not include data URL prefix')
    .refine(val => {
        try {
            // Node/Bun environment
            if (typeof Buffer !== 'undefined') {
                return Buffer.from(val, 'base64').toString('base64') === val
            }
            // Browser fallback
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const globalAny = globalThis as any
            if (typeof globalAny.btoa === 'function' && typeof globalAny.atob === 'function') {
                return globalAny.btoa(globalAny.atob(val)) === val
            }
            return true // Skip validation if neither is available
        } catch {
            return false
        }
    }, 'Invalid base64 format')
