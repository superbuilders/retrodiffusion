import { DEFAULT_CONFIG, ENDPOINTS } from '@/constants'
import { ensureValidBase64Image, validateInferenceRequest } from '@/utils'

import type {
    AnimationRequest,
    ImageToImageRequest,
    InferenceRequest,
    InferenceResponse,
    TextToImageRequest,
} from './types'

/**
 * Namespace for image generation and inference operations in the Retro Diffusion API.
 *
 * This class provides methods for generating pixel art and retro-style images using
 * different techniques including text-to-image, image-to-image transformation, and
 * walking animations. It supports multiple models (RD_FAST and RD_PLUS) with various
 * style presets optimized for different use cases.
 *
 * @example
 * ```typescript
 * const client = new RetroDiffusionClient({ apiKey: 'your-api-key' });
 *
 * // Generate a simple pixel art image
 * const result = await client.inference.textToImage({
 *   prompt: 'a magical sword with blue enchantment',
 *   prompt_style: 'rd_fast__game_asset',
 *   width: 256,
 *   height: 256
 * });
 *
 * console.log(`Generated image costs ${result.credit_cost} credits`);
 * ```
 */
export class InferencesNamespace {
    /**
     * Creates a new InferencesNamespace instance.
     *
     * @param apiRequest - The API request function provided by the main client.
     *                     This function handles authentication, error handling,
     *                     and network communication with the Retro Diffusion API.
     */
    constructor(
        private apiRequest: (endpoint: string, options?: RequestInit) => Promise<unknown>,
    ) {}

    /**
     * Generates images from text prompts using the Retro Diffusion API.
     *
     * This method creates pixel art and retro-style images based on your text description.
     * It supports various style presets for different use cases like game assets, UI elements,
     * portraits, and textures. The method automatically applies default configuration values
     * and validates the request before sending it to the API.
     *
     * @param request - The text-to-image generation request configuration
     * @param request.prompt - A descriptive text prompt for the image you want to generate
     * @param request.prompt_style - The style preset to apply (e.g., 'rd_fast__game_asset', 'rd_plus__retro')
     * @param request.width - Image width in pixels (supported: 64, 128, 256, 512)
     * @param request.height - Image height in pixels (supported: 64, 128, 256, 512)
     * @param request.num_images - Number of images to generate (1-10, default: 1)
     * @param request.seed - Random seed for reproducible results (optional)
     * @param request.remove_bg - Whether to remove the background for transparent images (optional)
     * @param request.tile_x - Enable horizontal tiling for seamless textures (optional)
     * @param request.tile_y - Enable vertical tiling for seamless textures (optional)
     * @param request.input_palette - Base64-encoded reference palette image (optional)
     * @param request.upscale_output_factor - Output scaling factor, null for default (optional)
     *
     * @returns A promise that resolves to the generated image response containing base64-encoded images
     *
     * @throws {ValidationError} When request parameters are invalid (e.g., unsupported dimensions)
     * @throws {AuthenticationError} When the API key is invalid or missing
     * @throws {InsufficientCreditsError} When you don't have enough credits for the operation
     * @throws {RateLimitError} When you've exceeded the API rate limits
     * @throws {NetworkError} When there's a network connectivity issue
     *
     * @example
     * ```typescript
     * // Basic text-to-image generation
     * const result = await client.inference.textToImage({
     *   prompt: 'a cute pixel art corgi wearing sunglasses',
     *   prompt_style: 'rd_fast__retro',
     *   width: 256,
     *   height: 256
     * });
     *
     * // Save the generated image
     * const imageData = result.base64_images[0];
     * const buffer = Buffer.from(imageData, 'base64');
     * fs.writeFileSync('generated-corgi.png', buffer);
     * ```
     *
     * @example
     * ```typescript
     * // Generate seamless texture with transparency
     * const texture = await client.inference.textToImage({
     *   prompt: 'stone brick wall texture',
     *   prompt_style: 'rd_fast__texture',
     *   width: 128,
     *   height: 128,
     *   tile_x: true,
     *   tile_y: true,
     *   remove_bg: true
     * });
     * ```
     *
     * @see {@link https://retrodiffusion.ai/} For available style presets and pricing
     */
    async textToImage(request: TextToImageRequest): Promise<InferenceResponse> {
        const payload = {
            ...DEFAULT_CONFIG,
            ...request,
        }

        validateInferenceRequest(payload)

        if (payload.input_palette) {
            payload.input_palette = ensureValidBase64Image(payload.input_palette, 'input_palette')
        }

        return this.apiRequest(ENDPOINTS.INFERENCES, {
            method: 'POST',
            body: JSON.stringify(payload),
        }) as Promise<InferenceResponse>
    }

    /**
     * Transforms existing images using text prompts and the Retro Diffusion API.
     *
     * This method takes an input image and modifies it based on your text description.
     * The strength parameter controls how much the original image is preserved versus
     * how much it's transformed. Lower strength values preserve more of the original
     * image, while higher values allow for more dramatic transformations.
     *
     * @param request - The image-to-image transformation request configuration
     * @param request.prompt - A descriptive text prompt for how to transform the image
     * @param request.input_image - Base64-encoded RGB image to transform (without data URL prefix)
     * @param request.strength - Transformation strength from 0 to 1 (0.8 = strong transformation)
     * @param request.prompt_style - The style preset to apply during transformation
     * @param request.width - Output image width in pixels (supported: 64, 128, 256, 512)
     * @param request.height - Output image height in pixels (supported: 64, 128, 256, 512)
     * @param request.num_images - Number of variations to generate (1-10, default: 1)
     * @param request.seed - Random seed for reproducible results (optional)
     *
     * @returns A promise that resolves to the transformed image response containing base64-encoded images
     *
     * @throws {ValidationError} When request parameters are invalid or image format is unsupported
     * @throws {AuthenticationError} When the API key is invalid or missing
     * @throws {InsufficientCreditsError} When you don't have enough credits for the operation
     * @throws {RateLimitError} When you've exceeded the API rate limits
     * @throws {NetworkError} When there's a network connectivity issue
     *
     * @example
     * ```typescript
     * // Transform a photo into pixel art
     * const fs = require('fs');
     * const inputImage = fs.readFileSync('photo.png');
     * const base64Image = inputImage.toString('base64');
     *
     * const result = await client.inference.imageToImage({
     *   prompt: 'retro pixel art style',
     *   input_image: base64Image,
     *   strength: 0.8,
     *   prompt_style: 'rd_fast__retro',
     *   width: 256,
     *   height: 256
     * });
     * ```
     *
     * @example
     * ```typescript
     * // Subtle modification with low strength
     * const result = await client.inference.imageToImage({
     *   prompt: 'add magical glow effects',
     *   input_image: base64Image,
     *   strength: 0.3, // Low strength preserves more of the original
     *   prompt_style: 'rd_plus__default'
     * });
     * ```
     *
     * @see {@link https://retrodiffusion.ai/} For examples and style presets
     */
    async imageToImage(request: ImageToImageRequest): Promise<InferenceResponse> {
        const payload = {
            ...DEFAULT_CONFIG,
            ...request,
            input_image: ensureValidBase64Image(request.input_image, 'input_image'),
        }

        validateInferenceRequest(payload)

        return this.apiRequest(ENDPOINTS.INFERENCES, {
            method: 'POST',
            body: JSON.stringify(payload),
        }) as Promise<InferenceResponse>
    }

    /**
     * Generates 4-directional walking animation sprites for games.
     *
     * This method creates pixel art walking animations showing a character from
     * four different angles (up, down, left, right). The output is fixed at 48x48
     * pixels and can be returned as either an animated GIF or a spritesheet PNG.
     * These animations are perfect for 2D games, RPGs, and interactive applications.
     *
     * @param request - The animation generation request configuration
     * @param request.prompt - A descriptive text prompt for the character to animate
     * @param request.width - Must be 48 (fixed for animations)
     * @param request.height - Must be 48 (fixed for animations)
     * @param request.num_images - Must be 1 (fixed for animations)
     * @param request.prompt_style - Must be 'animation__four_angle_walking'
     * @param request.return_spritesheet - If true, returns PNG spritesheet; if false, returns animated GIF
     * @param request.input_image - Optional base64-encoded reference image for character appearance
     * @param request.seed - Random seed for reproducible results (optional)
     *
     * @returns A promise that resolves to the animation response with base64-encoded GIF or PNG
     *
     * @throws {ValidationError} When animation parameters are invalid (wrong dimensions, style, etc.)
     * @throws {AuthenticationError} When the API key is invalid or missing
     * @throws {InsufficientCreditsError} When you don't have enough credits for the operation
     * @throws {RateLimitError} When you've exceeded the API rate limits
     * @throws {NetworkError} When there's a network connectivity issue
     *
     * @example
     * ```typescript
     * // Generate animated GIF of walking character
     * const animation = await client.inference.animation({
     *   prompt: 'knight in blue armor',
     *   width: 48,
     *   height: 48,
     *   num_images: 1,
     *   prompt_style: 'animation__four_angle_walking',
     *   return_spritesheet: false // Returns animated GIF
     * });
     *
     * // Save the animation
     * const animationData = animation.base64_images[0];
     * const buffer = Buffer.from(animationData, 'base64');
     * fs.writeFileSync('knight-walking.gif', buffer);
     * ```
     *
     * @example
     * ```typescript
     * // Generate spritesheet for game engine integration
     * const spritesheet = await client.inference.animation({
     *   prompt: 'magical wizard character',
     *   width: 48,
     *   height: 48,
     *   num_images: 1,
     *   prompt_style: 'animation__four_angle_walking',
     *   return_spritesheet: true, // Returns PNG spritesheet
     *   seed: 12345 // For consistent results
     * });
     * ```
     *
     * @see {@link https://retrodiffusion.ai/} For animation examples and tutorials
     */
    async animation(request: AnimationRequest): Promise<InferenceResponse> {
        const payload = {
            ...request,
            width: 48, // Fixed for animations
            height: 48, // Fixed for animations
            num_images: 1, // Fixed for animations
            prompt_style: 'animation__four_angle_walking' as const,
        }

        if (payload.input_image) {
            payload.input_image = ensureValidBase64Image(payload.input_image, 'input_image')
        }

        validateInferenceRequest(payload)

        return this.apiRequest(ENDPOINTS.INFERENCES, {
            method: 'POST',
            body: JSON.stringify(payload),
        }) as Promise<InferenceResponse>
    }

    /**
     * Generic inference method that can handle any type of image generation request.
     *
     * This is a flexible method that accepts any valid inference request type and
     * automatically handles the appropriate processing based on the request parameters.
     * It supports text-to-image, image-to-image, and animation requests in a unified
     * interface, making it useful for applications that need to handle multiple
     * generation types dynamically.
     *
     * @param request - Any valid inference request (TextToImage, ImageToImage, or Animation)
     * @param request.prompt - A descriptive text prompt for image generation
     * @param request.prompt_style - The style preset to apply
     * @param request.width - Image width in pixels (48 for animations, 64-512 for others)
     * @param request.height - Image height in pixels (48 for animations, 64-512 for others)
     * @param request.num_images - Number of images to generate (1 for animations, 1-10 for others)
     * @param request.seed - Random seed for reproducible results (optional)
     *
     * @returns A promise that resolves to the generated image response
     *
     * @throws {ValidationError} When request parameters are invalid
     * @throws {AuthenticationError} When the API key is invalid or missing
     * @throws {InsufficientCreditsError} When you don't have enough credits for the operation
     * @throws {RateLimitError} When you've exceeded the API rate limits
     * @throws {NetworkError} When there's a network connectivity issue
     *
     * @example
     * ```typescript
     * // Dynamic request handling
     * const requests = [
     *   {
     *     prompt: 'magic potion',
     *     prompt_style: 'rd_fast__game_asset',
     *     width: 256,
     *     height: 256
     *   },
     *   {
     *     prompt: 'walking mage',
     *     prompt_style: 'animation__four_angle_walking',
     *     width: 48,
     *     height: 48,
     *     num_images: 1
     *   }
     * ];
     *
     * for (const request of requests) {
     *   const result = await client.inference.create(request);
     *   console.log(`Generated with model: ${result.model}`);
     * }
     * ```
     *
     * @example
     * ```typescript
     * // Programmatic request building
     * const buildRequest = (type: 'item' | 'character') => {
     *   if (type === 'character') {
     *     return {
     *       prompt: 'warrior character',
     *       prompt_style: 'animation__four_angle_walking' as const,
     *       width: 48, height: 48, num_images: 1
     *     };
     *   } else {
     *     return {
     *       prompt: 'health potion',
     *       prompt_style: 'rd_fast__game_asset' as const,
     *       width: 256, height: 256
     *     };
     *   }
     * };
     *
     * const result = await client.inference.create(buildRequest('item'));
     * ```
     *
     * @see {@link textToImage} For text-to-image specific generation
     * @see {@link imageToImage} For image-to-image transformation
     * @see {@link animation} For animation generation
     */
    async create(request: InferenceRequest): Promise<InferenceResponse> {
        const payload = { ...DEFAULT_CONFIG, ...request }

        // Handle base64 images
        if ('input_image' in payload && payload.input_image) {
            payload.input_image = ensureValidBase64Image(payload.input_image, 'input_image')
        }

        if ('input_palette' in payload && payload.input_palette) {
            payload.input_palette = ensureValidBase64Image(payload.input_palette, 'input_palette')
        }

        validateInferenceRequest(payload)

        return this.apiRequest(ENDPOINTS.INFERENCES, {
            method: 'POST',
            body: JSON.stringify(payload),
        }) as Promise<InferenceResponse>
    }
}
