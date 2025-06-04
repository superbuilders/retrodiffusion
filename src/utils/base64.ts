import { ValidationError } from '../errors'

/**
 * Validates that a base64 string is properly formatted
 */
export function validateBase64(base64: string): boolean {
    if (!base64 || typeof base64 !== 'string') {
        return false
    }

    // Should not include data URL prefix
    if (base64.startsWith('data:')) {
        return false
    }

    try {
        // Node/Bun environment
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(base64, 'base64').toString('base64') === base64
        }

        // Browser fallback using atob/btoa
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalAny = globalThis as any
        if (typeof globalAny.btoa === 'function' && typeof globalAny.atob === 'function') {
            return globalAny.btoa(globalAny.atob(base64)) === base64
        }
        return false
    } catch {
        return false
    }
}

/**
 * Strips data URL prefix from base64 string if present
 */
export function stripDataUrlPrefix(base64: string): string {
    if (base64.startsWith('data:')) {
        const commaIndex = base64.indexOf(',')
        if (commaIndex !== -1) {
            return base64.substring(commaIndex + 1)
        }
    }
    return base64
}

/**
 * Converts a File or Blob to base64 string (Browser only)
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
    if (typeof FileReader === 'undefined') {
        throw new Error(
            'FileReader is not available. This function only works in browser environments.',
        )
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            resolve(stripDataUrlPrefix(result))
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

/**
 * Converts a Buffer to a base64 string (Node/Bun only)
 */
export function bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64')
}

/**
 * Validates base64 image and throws if invalid
 */
export function ensureValidBase64Image(base64: string, fieldName = 'image'): string {
    const cleaned = stripDataUrlPrefix(base64)

    if (!validateBase64(cleaned)) {
        throw new ValidationError(
            `Invalid base64 image format for ${fieldName}. Must be a valid base64 string without data URL prefix.`,
            fieldName,
        )
    }

    return cleaned
}
