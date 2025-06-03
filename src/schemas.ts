import { z } from 'zod'

import { ALL_STYLES, RD_FAST_STYLES, RD_PLUS_STYLES, SUPPORTED_RESOLUTIONS } from './constants'

// Base schemas
export const PromptStyleSchema = z.enum(ALL_STYLES as unknown as [string, ...string[]])

export const ClientConfigSchema = z.object({
    apiKey: z.string().min(1, 'API key is required'),
    baseUrl: z.string().url().optional(),
    timeout: z.number().positive().optional(),
    retries: z.number().min(0).max(5).optional(),
})

// API Response schemas
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

export const InferenceResponseSchema = ApiResponseSchema.extend({
    base64_images: z.array(z.string()),
    type: z.enum(['txt2img', 'img2img', 'animation']),
})

// Base64 validation helpers
const base64Schema = z
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

// Inference request schemas
export const BaseInferenceRequestSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required and cannot be empty'),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    num_images: z.number().min(1).max(10).optional(),
    seed: z.number().optional(),
    prompt_style: PromptStyleSchema.optional(),
})

export const TextToImageRequestSchema = BaseInferenceRequestSchema.extend({
    remove_bg: z.boolean().optional(),
    tile_x: z.boolean().optional(),
    tile_y: z.boolean().optional(),
    input_palette: base64Schema.optional(),
    upscale_output_factor: z.number().positive().nullable().optional(),
})

export const ImageToImageRequestSchema = BaseInferenceRequestSchema.extend({
    input_image: base64Schema,
    strength: z.number().min(0).max(1).optional(),
})

export const AnimationRequestSchema = BaseInferenceRequestSchema.extend({
    prompt_style: z.literal('animation__four_angle_walking'),
    width: z.literal(48),
    height: z.literal(48),
    num_images: z.literal(1),
    return_spritesheet: z.boolean().optional(),
    input_image: base64Schema.optional(),
})

export const InferenceRequestSchema = z.discriminatedUnion('prompt_style', [
    AnimationRequestSchema,
    TextToImageRequestSchema.extend({
        prompt_style: z
            .enum([...RD_FAST_STYLES, ...RD_PLUS_STYLES] as [string, ...string[]])
            .optional(),
    }),
    ImageToImageRequestSchema.extend({
        prompt_style: z
            .enum([...RD_FAST_STYLES, ...RD_PLUS_STYLES] as [string, ...string[]])
            .optional(),
    }),
])

// Dimension validation
export const DimensionValidationSchema = z
    .object({
        width: z.number(),
        height: z.number(),
        isAnimation: z.boolean().default(false),
    })
    .refine(
        ({ width, height, isAnimation }) => {
            const allowedSizes = isAnimation
                ? SUPPORTED_RESOLUTIONS.ANIMATION
                : SUPPORTED_RESOLUTIONS.STANDARD
            return (
                (allowedSizes as readonly number[]).includes(width) &&
                (allowedSizes as readonly number[]).includes(height)
            )
        },
        ({ isAnimation }) => {
            const allowedSizes = isAnimation
                ? SUPPORTED_RESOLUTIONS.ANIMATION
                : SUPPORTED_RESOLUTIONS.STANDARD
            const validSizes = allowedSizes.join(', ')
            const context = isAnimation ? 'animations' : 'standard images'
            return {
                message: `Invalid dimensions for ${context}. Supported sizes: ${validSizes}x${validSizes}`,
            }
        },
    )

// Enhanced validation schema that combines request validation with dimension checks
export const ValidatedInferenceRequestSchema = InferenceRequestSchema.refine(
    data => {
        if (data.width && data.height) {
            const isAnimation = data.prompt_style === 'animation__four_angle_walking'
            const result = DimensionValidationSchema.safeParse({
                width: data.width,
                height: data.height,
                isAnimation,
            })
            return result.success
        }
        return true
    },
    data => {
        const isAnimation = data.prompt_style === 'animation__four_angle_walking'
        const allowedSizes = isAnimation
            ? SUPPORTED_RESOLUTIONS.ANIMATION
            : SUPPORTED_RESOLUTIONS.STANDARD
        const validSizes = allowedSizes.join(', ')
        const context = isAnimation ? 'animations' : 'standard images'
        return {
            message: `Invalid dimensions for ${context}. Supported sizes: ${validSizes}x${validSizes}`,
            path: ['width', 'height'],
        }
    },
)

// Type exports inferred from schemas
export type PromptStyle = z.infer<typeof PromptStyleSchema>
export type ClientConfig = z.infer<typeof ClientConfigSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>
export type CreditsResponse = z.infer<typeof CreditsResponseSchema>
export type InferenceResponse = z.infer<typeof InferenceResponseSchema>
export type BaseInferenceRequest = z.infer<typeof BaseInferenceRequestSchema>
export type TextToImageRequest = z.infer<typeof TextToImageRequestSchema>
export type ImageToImageRequest = z.infer<typeof ImageToImageRequestSchema>
export type AnimationRequest = z.infer<typeof AnimationRequestSchema>
export type InferenceRequest = z.infer<typeof InferenceRequestSchema>
export type ValidatedInferenceRequest = z.infer<typeof ValidatedInferenceRequestSchema>
