export class RetroDiffusionError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
    ) {
        super(message)
        this.name = 'RetroDiffusionError'
    }
}

export class AuthenticationError extends RetroDiffusionError {
    constructor(message = 'Authentication failed. Please check your API key.') {
        super(message, 'AUTHENTICATION_ERROR')
        this.name = 'AuthenticationError'
    }
}

export class InsufficientCreditsError extends RetroDiffusionError {
    constructor(message = 'Insufficient credits. Please add more credits to your account.') {
        super(message, 'INSUFFICIENT_CREDITS')
        this.name = 'InsufficientCreditsError'
    }
}

export class ValidationError extends RetroDiffusionError {
    constructor(
        message: string,
        public readonly field?: string,
    ) {
        super(message, 'VALIDATION_ERROR')
        this.name = 'ValidationError'
    }
}

export class NetworkError extends RetroDiffusionError {
    constructor(
        message = 'Network error occurred.',
        public readonly statusCode?: number,
    ) {
        super(message, 'NETWORK_ERROR')
        this.name = 'NetworkError'
    }
}

export class RateLimitError extends RetroDiffusionError {
    constructor(message = 'Rate limit exceeded. Please try again later.') {
        super(message, 'RATE_LIMIT_ERROR')
        this.name = 'RateLimitError'
    }
}
