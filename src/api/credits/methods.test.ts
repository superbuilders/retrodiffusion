import { describe, expect, test } from 'bun:test'

import { createMockApiRequest, mockResponses } from '@/utils/test'

import { CreditsNamespace } from './methods'

describe('CreditsNamespace', () => {
    test('should be defined', () => {
        const mockApiRequest = createMockApiRequest()
        const credits = new CreditsNamespace(mockApiRequest)

        expect(credits).toBeDefined()
        expect(credits.get).toBeInstanceOf(Function)
    })

    test('should get credits successfully', async () => {
        const mockApiRequest = createMockApiRequest()
        mockApiRequest.mockResolvedValue(mockResponses.credits())

        const credits = new CreditsNamespace(mockApiRequest)
        const result = await credits.get()

        expect(result).toEqual({
            credits: 100,
        })

        expect(mockApiRequest).toHaveBeenCalledWith('/inferences/credits', {
            method: 'GET',
        })
    })

    test('should handle API errors', async () => {
        const mockApiRequest = createMockApiRequest()
        mockApiRequest.mockRejectedValue(new Error('Network error'))

        const credits = new CreditsNamespace(mockApiRequest)

        await expect(credits.get()).rejects.toThrow('Network error')
    })
})
