import { DEFAULT_CONFIG, ENDPOINTS } from '../../constants'
import { ensureValidBase64Image, validateInferenceRequest } from '../../utils'

import type {
    AnimationRequest,
    ImageToImageRequest,
    InferenceRequest,
    InferenceResponse,
    TextToImageRequest,
} from '../../api/inference/types'

export class InferencesNamespace {
    constructor(
        private apiRequest: (endpoint: string, options?: RequestInit) => Promise<unknown>,
    ) {}

    /**
     * Generate images from text prompt
     */
    async textToImage(request: TextToImageRequest): Promise<InferenceResponse> {
        const payload = {
            ...DEFAULT_CONFIG,
            ...request,
        }

        validateInferenceRequest(payload)

        if (payload.input_palette) {
            payload.input_palette = ensureValidBase64Image(payload.input_palette, 'input_palette')
        }

        return this.apiRequest(ENDPOINTS.INFERENCES, {
            method: 'POST',
            body: JSON.stringify(payload),
        }) as Promise<InferenceResponse>
    }

    /**
     * Generate images from existing image + text prompt
     */
    async imageToImage(request: ImageToImageRequest): Promise<InferenceResponse> {
        const payload = {
            ...DEFAULT_CONFIG,
            ...request,
            input_image: ensureValidBase64Image(request.input_image, 'input_image'),
        }

        validateInferenceRequest(payload)

        return this.apiRequest(ENDPOINTS.INFERENCES, {
            method: 'POST',
            body: JSON.stringify(payload),
        }) as Promise<InferenceResponse>
    }

    /**
     * Generate walking animation sprites
     */
    async animation(request: AnimationRequest): Promise<InferenceResponse> {
        const payload = {
            ...request,
            width: 48, // Fixed for animations
            height: 48, // Fixed for animations
            num_images: 1, // Fixed for animations
            prompt_style: 'animation__four_angle_walking' as const,
        }

        if (payload.input_image) {
            payload.input_image = ensureValidBase64Image(payload.input_image, 'input_image')
        }

        validateInferenceRequest(payload)

        return this.apiRequest(ENDPOINTS.INFERENCES, {
            method: 'POST',
            body: JSON.stringify(payload),
        }) as Promise<InferenceResponse>
    }

    /**
     * Generic inference method for any request type
     */
    async create(request: InferenceRequest): Promise<InferenceResponse> {
        const payload = { ...DEFAULT_CONFIG, ...request }

        // Handle base64 images
        if ('input_image' in payload && payload.input_image) {
            payload.input_image = ensureValidBase64Image(payload.input_image, 'input_image')
        }

        if ('input_palette' in payload && payload.input_palette) {
            payload.input_palette = ensureValidBase64Image(payload.input_palette, 'input_palette')
        }

        validateInferenceRequest(payload)

        return this.apiRequest(ENDPOINTS.INFERENCES, {
            method: 'POST',
            body: JSON.stringify(payload),
        }) as Promise<InferenceResponse>
    }
}
