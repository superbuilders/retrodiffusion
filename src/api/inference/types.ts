import { z } from 'zod'

import {
    AnimationRequestSchema,
    BaseInferenceRequestSchema,
    ImageToImageRequestSchema,
    InferenceRequestSchema,
    InferenceResponseSchema,
    PromptStyleSchema,
    TextToImageRequestSchema,
    ValidatedInferenceRequestSchema,
} from './schemas'

export type PromptStyle = z.infer<typeof PromptStyleSchema>
export type BaseInferenceRequest = z.infer<typeof BaseInferenceRequestSchema>
export type TextToImageRequest = z.infer<typeof TextToImageRequestSchema>
export type ImageToImageRequest = z.infer<typeof ImageToImageRequestSchema>
export type AnimationRequest = z.infer<typeof AnimationRequestSchema>
export type InferenceRequest = z.infer<typeof InferenceRequestSchema>
export type InferenceResponse = z.infer<typeof InferenceResponseSchema>
export type ValidatedInferenceRequest = z.infer<typeof ValidatedInferenceRequestSchema>

export interface GeneratedImage {
    base64: string
    format: 'png' | 'gif'
    width: number
    height: number
}
