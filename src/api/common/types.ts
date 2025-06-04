import { z } from 'zod'

import { ApiResponseSchema, ClientConfigSchema, CreditsResponseSchema } from './schemas'

export type ClientConfig = z.infer<typeof ClientConfigSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>
export type CreditsResponse = z.infer<typeof CreditsResponseSchema>
