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

/**
 * Main client class for interacting with the Retro Diffusion API.
 *
 * This is the primary entry point for the Retro Diffusion SDK. It provides access
 * to all API functionality through organized namespaces, handles authentication,
 * error management, and network communication. The client supports both RD_FAST
 * and RD_PLUS models for generating pixel art, retro-style images, and animations.
 *
 * The client automatically handles:
 * - API key authentication via multiple methods (config, environment variables)
 * - Request/response validation and transformation
 * - Error handling with custom exception types
 * - Rate limiting and retry logic
 * - Base64 image encoding/validation
 *
 * @example
 * ```typescript
 * // Initialize with explicit API key
 * const client = new RetroDiffusionClient({
 *   apiKey: 'your-api-key-here'
 * });
 *
 * // Or use environment variables (RD_TOKEN or RD_API_KEY)
 * const client = new RetroDiffusionClient();
 *
 * // Generate an image
 * const result = await client.inference.textToImage({
 *   prompt: 'pixel art sword with blue flames',
 *   prompt_style: 'rd_fast__game_asset',
 *   width: 256,
 *   height: 256
 * });
 *
 * // Check remaining credits
 * const credits = await client.credits.get();
 * console.log(`${credits.credits} credits remaining`);
 * ```
 */
export class RetroDiffusionClient {
    /**
     * Namespace for image generation and inference operations.
     *
     * Provides access to text-to-image, image-to-image, and animation generation
     * methods. This is where you'll find all the core image generation functionality.
     */
    public readonly inference: InferencesNamespace

    /**
     * Namespace for credit management operations.
     *
     * Provides methods to check your current credit balance and monitor usage.
     * Credits are consumed when generating images, with costs varying by model and settings.
     */
    public readonly credits: CreditsNamespace

    /**
     * Internal configuration object containing validated client settings.
     *
     * This includes the API key, base URL, timeout settings, and other configuration
     * options that control how the client communicates with the API.
     */
    private readonly config: ClientConfig & { apiKey: string }

    /**
     * Creates a new RetroDiffusionClient instance.
     *
     * Initializes the client with the provided configuration and sets up all
     * necessary namespaces and authentication. The API key can be provided via
     * the config object or through environment variables (RD_TOKEN or RD_API_KEY).
     *
     * @param config - Client configuration options
     * @param config.apiKey - Your Retro Diffusion API key (optional if using env vars)
     * @param config.baseUrl - Custom API base URL (optional, defaults to production API)
     * @param config.timeout - Request timeout in milliseconds (optional)
     * @param config.retries - Number of retry attempts for failed requests (0-5, optional)
     *
     * @throws {Error} When no API key is provided via config or environment variables
     * @throws {ValidationError} When the provided configuration is invalid
     *
     * @example
     * ```typescript
     * // Basic initialization with API key
     * const client = new RetroDiffusionClient({
     *   apiKey: 'rd_1234567890abcdef'
     * });
     * ```
     *
     * @example
     * ```typescript
     * // Advanced configuration
     * const client = new RetroDiffusionClient({
     *   apiKey: 'rd_1234567890abcdef',
     *   timeout: 30000, // 30 second timeout
     *   retries: 3,     // Retry failed requests 3 times
     *   baseUrl: 'https://api.retrodiffusion.ai/v1' // Custom endpoint
     * });
     * ```
     *
     * @example
     * ```typescript
     * // Using environment variables (set RD_TOKEN or RD_API_KEY)
     * process.env.RD_TOKEN = 'rd_1234567890abcdef';
     * const client = new RetroDiffusionClient(); // No config needed
     * ```
     *
     * @see {@link https://retrodiffusion.ai/app/devtools} To generate API keys
     * @see {@link https://retrodiffusion.ai/app/payment-methods} To purchase credits
     */
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
     * Internal API request method used by all namespaces.
     *
     * This method handles all HTTP communication with the Retro Diffusion API.
     * It automatically adds authentication headers, handles request formatting,
     * processes responses, and converts HTTP errors into appropriate SDK exceptions.
     * All namespace methods use this internally for consistent behavior.
     *
     * @param endpoint - The API endpoint path (e.g., '/inferences', '/inferences/credits')
     * @param options - Fetch API options for the request (method, body, headers, etc.)
     * @param options.method - HTTP method ('GET', 'POST', etc.)
     * @param options.body - Request body (usually JSON string for POST requests)
     * @param options.headers - Additional headers to include with the request
     *
     * @returns A promise that resolves to the parsed JSON response from the API
     *
     * @throws {AuthenticationError} When the API key is invalid or missing (401/403)
     * @throws {InsufficientCreditsError} When you don't have enough credits (402)
     * @throws {RateLimitError} When you've exceeded rate limits (429)
     * @throws {NetworkError} For other HTTP errors or network connectivity issues
     *
     * @private
     *
     * @example
     * ```typescript
     * // This method is used internally by namespace methods:
     * // client.inference.textToImage() -> this.apiRequest('/inferences', { method: 'POST', ... })
     * // client.credits.get() -> this.apiRequest('/inferences/credits', { method: 'GET' })
     * ```
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
     * Handles HTTP error responses and throws appropriate custom errors.
     *
     * This method processes failed HTTP responses from the API and converts them
     * into meaningful error objects with proper error types and messages. It attempts
     * to extract error details from the response body when available and maps HTTP
     * status codes to specific SDK error types for better error handling.
     *
     * @param response - The failed HTTP response object from fetch()
     *
     * @throws {AuthenticationError} For 401 (Unauthorized) and 403 (Forbidden) responses
     * @throws {InsufficientCreditsError} For 402 (Payment Required) responses
     * @throws {RateLimitError} For 429 (Too Many Requests) responses
     * @throws {NetworkError} For all other HTTP error status codes
     *
     * @private
     *
     * @example
     * ```typescript
     * // This method is called automatically when API requests fail:
     * try {
     *   const result = await client.inference.textToImage(request);
     * } catch (error) {
     *   if (error instanceof AuthenticationError) {
     *     console.error('Invalid API key:', error.message);
     *   } else if (error instanceof InsufficientCreditsError) {
     *     console.error('Not enough credits:', error.message);
     *   } else if (error instanceof RateLimitError) {
     *     console.error('Rate limited:', error.message);
     *   }
     * }
     * ```
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
