# Retro Diffusion SDK - Basic Example

A vanilla HTML example that demonstrates how to use the Retro Diffusion SDK in a web browser using import maps and Bun.serve.

## Features

- 🎨 Interactive web interface with Tailwind CSS
- 🔧 Import maps for module resolution
- 🚀 Served with Bun.serve
- 💾 API key persistence with localStorage
- 🖼️ Real-time image generation
- 📊 Credits display

## Setup

1. **Build the SDK first** (from the root directory):

    ```bash
    cd ../..
    bun run build
    ```

2. **Install dependencies**:

    ```bash
    bun install
    ```

3. **Start the server**:

    ```bash
    bun run dev
    ```

4. **Open your browser** to `http://localhost:3000`

## Usage

1. Enter your API key from [retrodiffusion.ai](https://retrodiffusion.ai)
2. Type a descriptive prompt
3. Choose a style and image size
4. Click "Generate Image"
5. Watch your pixel art come to life! 🎨

## How it works

- The HTML file uses **import maps** to resolve the SDK module
- **Bun.serve** serves the static HTML file
- The SDK is imported as an ES module directly in the browser
- All API interactions happen client-side with CORS support
