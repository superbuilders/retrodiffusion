import { ENDPOINTS } from '@/constants'

import type { CreditsResponse } from './types'

export class CreditsNamespace {
    constructor(
        private apiRequest: (endpoint: string, options?: RequestInit) => Promise<unknown>,
    ) {}

    /**
     * Get remaining credits for the current API key
     */
    async get(): Promise<CreditsResponse> {
        return this.apiRequest(ENDPOINTS.CREDITS, {
            method: 'GET',
        }) as Promise<CreditsResponse>
    }
}
