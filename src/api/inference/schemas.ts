import { ALL_STYLES, RD_FAST_STYLES, RD_PLUS_STYLES, SUPPORTED_RESOLUTIONS } from '@/constants'
import { z } from 'zod'

import { ApiResponseSchema, base64Schema } from '../common/schemas'

export const PromptStyleSchema = z.enum([...ALL_STYLES] as [string, ...string[]])

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

export const InferenceRequestSchema = z.union([
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

export const InferenceResponseSchema = ApiResponseSchema.extend({
    base64_images: z.array(z.string()),
    model: z.enum(['rd_fast', 'rd_plus']),
})

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
