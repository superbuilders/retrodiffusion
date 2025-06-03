import { mock } from 'bun:test'

import type { CreditsResponse, InferenceResponse } from '@/api'

/**
 * Mock API request function for testing
 */
export function createMockApiRequest() {
    return mock<(endpoint: string, options?: RequestInit) => Promise<unknown>>()
}

/**
 * Mock responses for testing
 */
export const mockResponses = {
    credits: (): CreditsResponse => ({
        credits: 100,
    }),

    inference: (): InferenceResponse => ({
        created_at: 1704067200000, // Fixed timestamp: 2024-01-01 00:00:00 UTC
        credit_cost: 1,
        remaining_credits: 99,
        base64_images: [
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        ],
        type: 'txt2img' as const,
    }),

    error401: () => ({
        status: 401,
        statusText: 'Unauthorized',
        ok: false,
        json: async () => ({ message: 'Invalid API key' }),
    }),

    error429: () => ({
        status: 429,
        statusText: 'Too Many Requests',
        ok: false,
        json: async () => ({ message: 'Rate limit exceeded' }),
    }),
} as const

/**
 * Helper to create a mock fetch Response
 */
export function createMockResponse(data: unknown, status = 200, statusText = 'OK') {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText,
        json: async () => data,
        text: async () => JSON.stringify(data),
    } as Response
}

/**
 * Common test data
 */
export const testData = {
    textToImageRequest: {
        prompt: 'A cute corgi wearing sunglasses',
        width: 256,
        height: 256,
        num_images: 1,
        prompt_style: 'rd_fast__retro' as const,
    },

    imageToImageRequest: {
        prompt: 'A cute corgi with a hat',
        width: 256,
        height: 256,
        input_image:
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        strength: 0.8,
    },

    animationRequest: {
        prompt: 'Walking corgi',
        width: 48 as const,
        height: 48 as const,
        num_images: 1 as const,
        prompt_style: 'animation__four_angle_walking' as const,
    },

    invalidRequest: {
        prompt: '', // Empty prompt should fail validation
        width: 999, // Invalid width
        height: 999, // Invalid height
    },
} as const
