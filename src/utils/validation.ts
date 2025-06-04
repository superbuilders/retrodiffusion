import {
    DimensionValidationSchema,
    InferenceRequestSchema,
    PromptStyleSchema,
    ValidatedInferenceRequestSchema,
} from '@/api/inference/schemas'
import { ValidationError } from '@/errors'
import { ZodError } from 'zod'

import type { InferenceRequest, PromptStyle } from '@/api/inference/types'

/**
 * Validates image dimensions using Zod schema
 */
export function validateDimensions(width: number, height: number, isAnimation = false): void {
    try {
        DimensionValidationSchema.parse({ width, height, isAnimation })
    } catch (error) {
        if (error instanceof ZodError) {
            const issue = error.issues[0] || { message: 'Invalid dimensions' }
            throw new ValidationError(issue.message, 'dimensions')
        }
        throw error
    }
}

/**
 * Validates prompt style using Zod schema
 */
export function validatePromptStyle(style: string): PromptStyle {
    try {
        return PromptStyleSchema.parse(style) as PromptStyle
    } catch (error) {
        if (error instanceof ZodError) {
            const issue = error.issues[0] || { message: 'Invalid prompt style' }
            throw new ValidationError(issue.message, 'prompt_style')
        }
        throw error
    }
}

/**
 * Validates strength parameter (now handled by schema, but kept for backwards compatibility)
 */
export function validateStrength(strength: number): void {
    if (strength < 0 || strength > 1) {
        throw new ValidationError('Strength must be between 0 and 1', 'strength')
    }
}

/**
 * Validates number of images (now handled by schema, but kept for backwards compatibility)
 */
export function validateNumImages(numImages: number, isAnimation = false): void {
    if (isAnimation && numImages !== 1) {
        throw new ValidationError(
            'Animations only support generating 1 image at a time',
            'num_images',
        )
    }

    if (numImages < 1 || numImages > 10) {
        throw new ValidationError('Number of images must be between 1 and 10', 'num_images')
    }
}

/**
 * Validates a complete inference request using Zod schema
 */
export function validateInferenceRequest(request: InferenceRequest): void {
    try {
        ValidatedInferenceRequestSchema.parse(request)
    } catch (error) {
        if (error instanceof ZodError) {
            // Get the first error and throw a ValidationError
            const issue = error.issues[0] || { message: 'Validation failed', path: [] }
            const field = issue.path.length > 0 ? issue.path.join('.') : undefined
            throw new ValidationError(issue.message, field)
        }
        throw error
    }
}

/**
 * Safe validation that returns result instead of throwing
 */
export function safeValidateInferenceRequest(request: unknown) {
    return ValidatedInferenceRequestSchema.safeParse(request)
}

/**
 * Parse and validate an inference request, throwing detailed errors
 */
export function parseInferenceRequest(request: unknown): InferenceRequest {
    try {
        return InferenceRequestSchema.parse(request) as InferenceRequest
    } catch (error) {
        if (error instanceof ZodError) {
            const issue = error.issues[0] || { message: 'Validation failed', path: [] }
            const field = issue.path.length > 0 ? issue.path.join('.') : undefined
            throw new ValidationError(issue.message, field)
        }
        throw error
    }
}
