import { ENDPOINTS } from '@/constants'

import type { CreditsResponse } from './types'

/**
 * Namespace for credit-related operations in the Retro Diffusion API.
 *
 * This class provides methods to check your current credit balance and manage
 * credit-related operations. Credits are consumed when generating images, with
 * different models and settings having different credit costs.
 *
 * @example
 * ```typescript
 * const client = new RetroDiffusionClient({ apiKey: 'your-api-key' });
 * const credits = await client.credits.get();
 * console.log(`You have ${credits.credits} credits remaining`);
 * ```
 */
export class CreditsNamespace {
    /**
     * Creates a new CreditsNamespace instance.
     *
     * @param apiRequest - The API request function provided by the main client.
     *                     This function handles authentication, error handling,
     *                     and network communication with the Retro Diffusion API.
     */
    constructor(
        private apiRequest: (endpoint: string, options?: RequestInit) => Promise<unknown>,
    ) {}

    /**
     * Retrieves the current credit balance for your API key.
     *
     * This method makes a GET request to the credits endpoint to fetch your
     * current available credits. Credits are consumed when generating images,
     * and the cost varies based on the model, resolution, and other parameters.
     *
     * @returns A promise that resolves to an object containing your current credit balance
     *
     * @throws {AuthenticationError} When the API key is invalid or missing
     * @throws {NetworkError} When there's a network connectivity issue
     * @throws {RateLimitError} When you've exceeded the API rate limits
     *
     * @example
     * ```typescript
     * try {
     *   const result = await client.credits.get();
     *   console.log(`Available credits: ${result.credits}`);
     *
     *   if (result.credits < 10) {
     *     console.warn('Low credit balance - consider purchasing more credits');
     *   }
     * } catch (error) {
     *   if (error instanceof AuthenticationError) {
     *     console.error('Invalid API key');
     *   } else {
     *     console.error('Failed to fetch credits:', error.message);
     *   }
     * }
     * ```
     *
     * @see {@link https://retrodiffusion.ai/app/payment-methods} To purchase more credits
     * @see {@link https://retrodiffusion.ai/app/devtools} To manage your API keys
     */
    async get(): Promise<CreditsResponse> {
        return this.apiRequest(ENDPOINTS.CREDITS, {
            method: 'GET',
        }) as Promise<CreditsResponse>
    }
}
