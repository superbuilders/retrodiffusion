export const API_BASE_URL = 'https://api.retrodiffusion.ai/v1'
export const LEGACY_API_BASE_URL = 'https://api.retrodiffusion.ai/v1/inferences/legacy'

export const ENDPOINTS = {
    INFERENCES: '/inferences',
    CREDITS: '/inferences/credits',
} as const

export const MODELS = {
    RD_FAST: 'RD_FAST',
    RD_PLUS: 'RD_PLUS',
} as const

export const RD_FAST_STYLES = [
    'rd_fast__default',
    'rd_fast__retro',
    'rd_fast__simple',
    'rd_fast__detailed',
    'rd_fast__anime',
    'rd_fast__game_asset',
    'rd_fast__portrait',
    'rd_fast__texture',
    'rd_fast__ui',
    'rd_fast__item_sheet',
    'rd_fast__mc_texture',
    'rd_fast__mc_item',
    'rd_fast__character_turnaround',
    'rd_fast__1_bit',
    'rd_fast__no_style',
] as const

export const RD_PLUS_STYLES = [
    'rd_plus__default',
    'rd_plus__retro',
    'rd_plus__watercolor',
    'rd_plus__textured',
    'rd_plus__cartoon',
    'rd_plus__ui_element',
    'rd_plus__item_sheet',
    'rd_plus__character_turnaround',
    'rd_plus__topdown_map',
    'rd_plus__topdown_asset',
    'rd_plus__isometric',
    'rd_plus__isometric_asset',
] as const

export const ANIMATION_STYLES = ['animation__four_angle_walking'] as const

export const ALL_STYLES = [...RD_FAST_STYLES, ...RD_PLUS_STYLES, ...ANIMATION_STYLES] as const

export const SUPPORTED_RESOLUTIONS = {
    STANDARD: [64, 128, 256, 512] as const,
    ANIMATION: [48] as const, // Animations only support 48x48
} as const

export const DEFAULT_CONFIG = {
    width: 256,
    height: 256,
    num_images: 1,
    strength: 0.8, // For img2img
} as const
