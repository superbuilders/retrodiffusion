import { ALL_STYLES } from '@/constants'
import { z } from 'zod'

import {
    AnimationRequestSchema,
    BaseInferenceRequestSchema,
    ImageToImageRequestSchema,
    InferenceRequestSchema,
    InferenceResponseSchema,
    TextToImageRequestSchema,
    ValidatedInferenceRequestSchema,
} from './schemas'

export type PromptStyle = (typeof ALL_STYLES)[number]

export type BaseInferenceRequest = z.infer<typeof BaseInferenceRequestSchema>

export type TextToImageRequest = Omit<z.infer<typeof TextToImageRequestSchema>, 'prompt_style'> & {
    prompt_style?: PromptStyle
}

export type ImageToImageRequest = Omit<
    z.infer<typeof ImageToImageRequestSchema>,
    'prompt_style'
> & {
    prompt_style?: PromptStyle
}

export type AnimationRequest = z.infer<typeof AnimationRequestSchema>

export type InferenceRequest = TextToImageRequest | ImageToImageRequest | AnimationRequest

export type InferenceResponse = z.infer<typeof InferenceResponseSchema>

export type ValidatedInferenceRequest = z.infer<typeof ValidatedInferenceRequestSchema>

export type ParsedInferenceRequest = z.infer<typeof InferenceRequestSchema> & InferenceRequest

export interface GeneratedImage {
    base64: string
    format: 'png' | 'gif'
    width: number
    height: number
}
