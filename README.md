# retrodiffusion-sdk

A TypeScript/JavaScript SDK client for the [Retro Diffusion API](https://www.retrodiffusion.ai/) - Generate pixel art and retro-style images with AI.

## Installation

```bash
bun install
```

## Quick Start

```typescript
import { RetroDiffusionClient } from '@superbuilders/retrodiffusion'

const client = new RetroDiffusionClient({
    apiKey: 'your-api-key', // or set RD_TOKEN environment variable
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

## Examples

### 🌐 Basic Web Example

A complete vanilla HTML example with a beautiful UI:

```bash
cd examples/basic
bun install
bun run dev
# Open http://localhost:3000
```

Features:

- Interactive web interface with Tailwind CSS
- Import maps for module resolution
- Real-time image generation
- API key persistence

See [`examples/basic/`](./examples/basic/) for the full implementation.

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
