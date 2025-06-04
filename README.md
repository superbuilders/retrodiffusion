# @superbuilders/retrodiffusion

An unofficial TypeScript/JavaScript SDK client for the [Retro Diffusion API](https://www.retrodiffusion.ai/) - Generate pixel art and retro-style images with AI.

## Installation

```bash
# bun
bun add @superbuilders/retrodiffusion

# npm
npm install @superbuilders/retrodiffusion

# yarn
yarn add @superbuilders/retrodiffusion

# pnpm
pnpm add @superbuilders/retrodiffusion
```

## Quick Start

```typescript
import { RetroDiffusionClient } from '@superbuilders/retrodiffusion'

const client = new RetroDiffusionClient({
    apiKey: 'your-api-key', // or set RD_TOKEN or RD_API_KEY environment variable
})

// Generate a retro-style image
const result = await client.inference.textToImage({
    prompt: 'A cute corgi wearing sunglasses',
    prompt_style: 'rd_fast__retro',
    width: 256,
    height: 256,
})

console.log(`Generated ${result.base64_images.length} images!`)
console.log(`Credits used: ${result.credit_cost}`)
```

## API Reference

### RetroDiffusionClient

The main client class for interacting with the Retro Diffusion API.

#### Constructor

```typescript
new RetroDiffusionClient(config?: ClientConfig)
```

**Parameters:**

- `config` (optional): Configuration object
    - `apiKey?: string` - Your API key (can also be set via `RD_TOKEN` or `RD_API_KEY` environment variables)
    - `baseUrl?: string` - Custom API base URL (optional, defaults to production API)
    - `timeout?: number` - Request timeout in milliseconds (optional)
    - `retries?: number` - Number of retry attempts for failed requests (0-5, optional)

**Example:**

```typescript
// Explicit API key
const client = new RetroDiffusionClient({ apiKey: 'your-api-key' })

// Using environment variables
const client = new RetroDiffusionClient()
```

#### Properties

- `inference: InferencesNamespace` - Image generation and inference operations
- `credits: CreditsNamespace` - Credit balance and management operations

### InferencesNamespace

Handles all image generation operations including text-to-image, image-to-image transformations, and animations.

#### textToImage()

Generates images from text prompts.

```typescript
textToImage(request: TextToImageRequest): Promise<InferenceResponse>
```

**Parameters:**

- `prompt: string` - Descriptive text prompt for the image
- `prompt_style?: PromptStyle` - Style preset to apply (see [Prompt Styles](#prompt-styles))
- `width?: number` - Image width in pixels (64, 128, 256, 512)
- `height?: number` - Image height in pixels (64, 128, 256, 512)
- `num_images?: number` - Number of images to generate (1-10, default: 1)
- `seed?: number` - Random seed for reproducible results
- `remove_bg?: boolean` - Remove background for transparent images
- `tile_x?: boolean` - Enable horizontal tiling for seamless textures
- `tile_y?: boolean` - Enable vertical tiling for seamless textures
- `input_palette?: string` - Base64-encoded reference palette image
- `upscale_output_factor?: number | null` - Output scaling factor

**Example:**

```typescript
// Basic generation
const result = await client.inference.textToImage({
    prompt: 'magical sword with blue flames',
    prompt_style: 'rd_fast__game_asset',
    width: 256,
    height: 256,
})

// Seamless texture with transparency
const texture = await client.inference.textToImage({
    prompt: 'stone brick wall texture',
    prompt_style: 'rd_fast__texture',
    width: 128,
    height: 128,
    tile_x: true,
    tile_y: true,
    remove_bg: true,
})
```

#### imageToImage()

Transforms existing images using text prompts.

```typescript
imageToImage(request: ImageToImageRequest): Promise<InferenceResponse>
```

**Parameters:**

- `prompt: string` - Text description for the transformation
- `input_image: string` - Base64-encoded RGB image (without data URL prefix)
- `strength?: number` - Transformation strength 0-1 (default: 0.8, higher = more transformation)
- `prompt_style?: PromptStyle` - Style preset to apply
- `width?: number` - Output image width
- `height?: number` - Output image height
- `num_images?: number` - Number of variations to generate (1-10)
- `seed?: number` - Random seed for reproducible results

**Example:**

```typescript
// Load and transform an image
const fs = require('fs')
const inputImage = fs.readFileSync('photo.png')
const base64Image = inputImage.toString('base64')

const result = await client.inference.imageToImage({
    prompt: 'retro pixel art style',
    input_image: base64Image,
    strength: 0.8,
    prompt_style: 'rd_fast__retro',
    width: 256,
    height: 256,
})
```

#### animation()

Generates 4-directional walking animation sprites.

```typescript
animation(request: AnimationRequest): Promise<InferenceResponse>
```

**Parameters:**

- `prompt: string` - Description of the character
- `prompt_style: 'animation__four_angle_walking'` - Must be this specific style
- `width: 48` - Must be 48 pixels
- `height: 48` - Must be 48 pixels
- `num_images: 1` - Must be 1
- `return_spritesheet?: boolean` - Return as spritesheet instead of individual frames
- `input_image?: string` - Optional reference image
- `seed?: number` - Random seed for reproducible results

**Example:**

```typescript
const animation = await client.inference.animation({
    prompt: 'brave knight in shining armor',
    prompt_style: 'animation__four_angle_walking',
    width: 48,
    height: 48,
    num_images: 1,
    return_spritesheet: true,
})
```

#### create()

Generic inference method that accepts any inference request type.

```typescript
create(request: InferenceRequest): Promise<InferenceResponse>
```

**Parameters:**

- `request: InferenceRequest` - Any valid inference request (TextToImage, ImageToImage, or Animation)

### CreditsNamespace

Handles credit balance operations.

#### get()

Retrieves your current credit balance.

```typescript
get(): Promise<CreditsResponse>
```

**Returns:** Promise resolving to an object with your credit balance.

**Example:**

```typescript
const credits = await client.credits.get()
console.log(`Available credits: ${credits.credits}`)

if (credits.credits < 10) {
    console.warn('Low credit balance!')
}
```

### Types

#### InferenceResponse

```typescript
interface InferenceResponse {
    base64_images: string[] // Array of base64-encoded images
    credit_cost: number // Credits consumed for this request
    model: 'rd_fast' | 'rd_plus' // Model used for generation
    created_at: number // Timestamp when the request was created
    remaining_credits: number // Credits remaining after this request
}
```

#### CreditsResponse

```typescript
interface CreditsResponse {
    credits: number // Current available credits
}
```

### Prompt Styles

The SDK supports multiple prompt styles optimized for different use cases:

#### RD_FAST Styles (Lower cost, faster generation)

- `rd_fast__default` - Balanced pixel art style
- `rd_fast__retro` - Classic retro gaming aesthetics
- `rd_fast__simple` - Clean, minimal pixel art
- `rd_fast__detailed` - More complex pixel art
- `rd_fast__anime` - Anime-inspired pixel art
- `rd_fast__game_asset` - Optimized for game sprites and assets
- `rd_fast__portrait` - Character portraits and faces
- `rd_fast__texture` - Seamless textures and patterns
- `rd_fast__ui` - User interface elements
- `rd_fast__item_sheet` - Item collections and inventories
- `rd_fast__mc_texture` - Minecraft-style textures
- `rd_fast__mc_item` - Minecraft-style items
- `rd_fast__character_turnaround` - Character reference sheets
- `rd_fast__1_bit` - 1-bit black and white style
- `rd_fast__no_style` - Minimal style processing

#### RD_PLUS Styles (Higher quality, more credits)

- `rd_plus__default` - High-quality balanced style
- `rd_plus__retro` - Premium retro aesthetics
- `rd_plus__watercolor` - Watercolor-style rendering
- `rd_plus__textured` - Rich textured appearance
- `rd_plus__cartoon` - Cartoon-style illustrations
- `rd_plus__ui_element` - Polished UI components
- `rd_plus__item_sheet` - Premium item collections
- `rd_plus__character_turnaround` - Detailed character sheets
- `rd_plus__topdown_map` - Top-down game maps
- `rd_plus__topdown_asset` - Top-down game assets
- `rd_plus__isometric` - Isometric perspective art
- `rd_plus__isometric_asset` - Isometric game assets

#### Animation Styles

- `animation__four_angle_walking` - 4-directional walking sprites (48x48 only)

### Error Handling

The SDK provides specific error classes for different failure scenarios:

```typescript
import {
    AuthenticationError,
    InsufficientCreditsError,
    NetworkError,
    RateLimitError,
    RetroDiffusionError,
    ValidationError,
} from '@superbuilders/retrodiffusion'

try {
    const result = await client.inference.textToImage({
        prompt: 'pixel art sword',
        prompt_style: 'rd_fast__game_asset',
    })
} catch (error) {
    if (error instanceof AuthenticationError) {
        console.error('Invalid API key')
    } else if (error instanceof InsufficientCreditsError) {
        console.error('Not enough credits')
    } else if (error instanceof ValidationError) {
        console.error('Invalid request parameters:', error.message)
    } else if (error instanceof RateLimitError) {
        console.error('Rate limit exceeded')
    } else if (error instanceof NetworkError) {
        console.error('Network error:', error.statusCode)
    }
}
```

### Configuration

#### Supported Resolutions

- **Standard images**: 64x64, 128x128, 256x256, 512x512
- **Animations**: 48x48 only

#### Default Values

- `width`: 256
- `height`: 256
- `num_images`: 1
- `strength`: 0.8 (for image-to-image)

#### Environment Variables

- `RD_TOKEN` - Alternative to setting apiKey in constructor
- `RD_API_KEY` - Alternative to setting apiKey in constructor

## Examples

### 🌐 Basic Web Example

A complete vanilla HTML example with a beautiful UI:

```bash
cd examples/basic
bun i
bun dev
```

See [`examples/basic/`](./examples/basic/) for the full implementation.

### Advanced Examples

#### Batch Generation with Error Handling

```typescript
async function generateVariations(prompt: string, count: number) {
    const results = []

    for (let i = 0; i < count; i++) {
        try {
            const result = await client.inference.textToImage({
                prompt,
                prompt_style: 'rd_fast__game_asset',
                width: 256,
                height: 256,
                seed: Math.random() * 1000000, // Different seed each time
            })
            results.push(result)
        } catch (error) {
            console.error(`Failed to generate image ${i + 1}:`, error.message)
        }
    }

    return results
}
```

#### Saving Generated Images

```typescript
import fs from 'fs'

const result = await client.inference.textToImage({
    prompt: 'fantasy weapon collection',
    prompt_style: 'rd_fast__item_sheet',
    width: 512,
    height: 512,
})

// Save each generated image
result.base64_images.forEach((base64, index) => {
    const buffer = Buffer.from(base64, 'base64')
    fs.writeFileSync(`generated-image-${index + 1}.png`, buffer)
})

console.log(`Saved ${result.base64_images.length} images, cost: ${result.credit_cost} credits`)
```

#### Creating Tileable Textures

```typescript
const tileableTexture = await client.inference.textToImage({
    prompt: 'medieval stone wall texture',
    prompt_style: 'rd_fast__texture',
    width: 128,
    height: 128,
    tile_x: true,
    tile_y: true,
    remove_bg: false,
})
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the SDK
bun run build

# Generate type definitions
bun run types
```

## About Retro Diffusion

Retro Diffusion is an AI service that specializes in generating pixel art, retro-style images, and game assets. The API supports:

- **Text-to-image** generation with retro and pixel art styles
- **Image-to-image** transformation
- **Animations** (48x48 walking sprites)
- **Background removal** for transparent images
- **Seamless tiling** for textures
- **Multiple models**: RD_FAST and RD_PLUS with various style presets

Visit [retrodiffusion.ai](https://www.retrodiffusion.ai/) to get your API key and explore available styles.

## License

MIT - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
