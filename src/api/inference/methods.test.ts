import { describe, expect, test } from 'bun:test'

import { createMockApiRequest, mockResponses, testData } from '@/utils/test'

import { InferencesNamespace } from './methods'

describe('InferencesNamespace', () => {
    test('should be defined', () => {
        const mockApiRequest = createMockApiRequest()
        const inference = new InferencesNamespace(mockApiRequest)

        expect(inference).toBeDefined()
        expect(inference.textToImage).toBeInstanceOf(Function)
        expect(inference.imageToImage).toBeInstanceOf(Function)
        expect(inference.animation).toBeInstanceOf(Function)
        expect(inference.create).toBeInstanceOf(Function)
    })

    describe('textToImage', () => {
        test('should generate text-to-image successfully', async () => {
            const mockApiRequest = createMockApiRequest()
            mockApiRequest.mockResolvedValue(mockResponses.inference())

            const inference = new InferencesNamespace(mockApiRequest)
            const result = await inference.textToImage(testData.textToImageRequest)

            expect(result).toEqual(mockResponses.inference())

            expect(mockApiRequest).toHaveBeenCalledWith('/inferences', {
                method: 'POST',
                body: JSON.stringify({
                    // DEFAULT_CONFIG merged with request
                    width: 256,
                    height: 256,
                    num_images: 1,
                    strength: 0.8,
                    prompt: 'A cute corgi wearing sunglasses',
                    prompt_style: 'rd_fast__retro',
                }),
            })
        })

        test('should handle validation errors', async () => {
            const mockApiRequest = createMockApiRequest()
            const inference = new InferencesNamespace(mockApiRequest)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(inference.textToImage(testData.invalidRequest as any)).rejects.toThrow()
        })
    })

    describe('imageToImage', () => {
        test('should generate image-to-image successfully', async () => {
            const mockApiRequest = createMockApiRequest()
            mockApiRequest.mockResolvedValue(mockResponses.inference())

            const inference = new InferencesNamespace(mockApiRequest)
            const result = await inference.imageToImage(testData.imageToImageRequest)

            expect(result).toEqual(mockResponses.inference())
            expect(mockApiRequest).toHaveBeenCalled()
        })
    })

    describe('animation', () => {
        test('should generate animation successfully', async () => {
            const mockApiRequest = createMockApiRequest()
            mockApiRequest.mockResolvedValue(mockResponses.inference())

            const inference = new InferencesNamespace(mockApiRequest)
            const result = await inference.animation(testData.animationRequest)

            expect(result).toEqual(mockResponses.inference())
            expect(mockApiRequest).toHaveBeenCalled()
        })

        test('should enforce animation constraints', async () => {
            const mockApiRequest = createMockApiRequest()
            mockApiRequest.mockResolvedValue(mockResponses.inference())

            const inference = new InferencesNamespace(mockApiRequest)
            await inference.animation(testData.animationRequest)

            expect(mockApiRequest).toHaveBeenCalledWith('/inferences', {
                method: 'POST',
                body: expect.stringContaining('"width":48'),
            })
            expect(mockApiRequest).toHaveBeenCalledWith('/inferences', {
                method: 'POST',
                body: expect.stringContaining('"height":48'),
            })
            expect(mockApiRequest).toHaveBeenCalledWith('/inferences', {
                method: 'POST',
                body: expect.stringContaining('"num_images":1'),
            })
        })
    })

    describe('create', () => {
        test('should create inference with generic method', async () => {
            const mockApiRequest = createMockApiRequest()
            mockApiRequest.mockResolvedValue(mockResponses.inference())

            const inference = new InferencesNamespace(mockApiRequest)
            const result = await inference.create(testData.textToImageRequest)

            expect(result).toEqual(mockResponses.inference())
            expect(mockApiRequest).toHaveBeenCalled()
        })
    })

    test('should handle API errors', async () => {
        const mockApiRequest = createMockApiRequest()
        mockApiRequest.mockRejectedValue(new Error('Network error'))

        const inference = new InferencesNamespace(mockApiRequest)

        expect(inference.textToImage(testData.textToImageRequest)).rejects.toThrow('Network error')
    })
})
