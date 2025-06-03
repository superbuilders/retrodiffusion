/* Minimal browser type shims for non-DOM environments */

export {}

declare global {
    interface FileReader {
        onload: null | (() => void)
        onerror: null | (() => void)
        result: string | ArrayBuffer | null
        readAsDataURL(blob: unknown): void
    }

    // Provide minimal type aliases for non-DOM environments
    // They are intentionally loose (unknown) to avoid type conflicts
    type File = unknown
    type Blob = unknown

    const FileReader: {
        new (): FileReader
    }
}
