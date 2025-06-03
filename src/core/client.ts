import { ClientConfigSchema } from '@/api/common/schemas'
import { CreditsNamespace } from '@/api/credits/methods'
import { InferencesNamespace } from '@/api/inference/methods'
import { API_BASE_URL } from '@/constants'
import {
    AuthenticationError,
    InsufficientCreditsError,
    NetworkError,
    RateLimitError,
} from '@/errors'

import type { ClientConfig } from '@/api/common/types'

export class RetroDiffusionClient {
    public readonly inference: InferencesNamespace
    public readonly credits: CreditsNamespace

    private readonly config: ClientConfig & { apiKey: string }

    constructor(config: ClientConfig = {}) {
        const validatedConfig = ClientConfigSchema.parse(config)

        const apiKey = validatedConfig.apiKey || process.env.RD_TOKEN || process.env.RD_API_KEY

        if (!apiKey) {
            throw new Error(
                'API key is required. Provide it via config.apiKey or set RD_TOKEN/RD_API_KEY environment variable.',
            )
        }

        this.config = {
            ...validatedConfig,
            apiKey,
        }

        this.inference = new InferencesNamespace(this.apiRequest.bind(this))
        this.credits = new CreditsNamespace(this.apiRequest.bind(this))
    }

    /**
     * Internal API request method used by all namespaces
     */
    private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
        const url = `${this.config.baseUrl || API_BASE_URL}${endpoint}`

        const headers = {
            'Content-Type': 'application/json',
            'X-RD-Token': this.config.apiKey,
            ...options.headers,
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            })

            if (!response.ok) {
                await this.handleErrorResponse(response)
            }

            return await response.json()
        } catch (error) {
            if (error instanceof Error && error.name.includes('RetroDiffusion')) {
                throw error // Re-throw our custom errors
            }
            throw new NetworkError(
                `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            )
        }
    }

    /**
     * Handle HTTP error responses and throw appropriate custom errors
     */
    private async handleErrorResponse(response: Response): Promise<never> {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
            const errorBody = (await response.json()) as { message?: string }
            if (errorBody.message) {
                errorMessage = errorBody.message
            }
        } catch {
            // If we can't parse the error body, use the default message
        }

        switch (response.status) {
            case 401:
            case 403:
                throw new AuthenticationError(errorMessage)
            case 402:
                throw new InsufficientCreditsError(errorMessage)
            case 429:
                throw new RateLimitError(errorMessage)
            default:
                throw new NetworkError(errorMessage, response.status)
        }
    }
}
