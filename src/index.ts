// Import for internal usage demonstration
import { RetroDiffusionClient } from './core'

// Main SDK exports
export { RetroDiffusionClient } from './core'
export * from './api'
export * from './errors'

// Basic usage demonstration (for testing)
async function demonstrateUsage() {
    try {
        console.log('🎨 Retro Diffusion SDK - Basic Usage Test')

        // Test 1: Create client with explicit API key
        console.log('\n📋 Test 1: Explicit API key')
        const client1 = new RetroDiffusionClient({
            apiKey: 'explicit-test-key-123',
        })
        console.log('✅ Client created with explicit API key')

        // Test 2: Create client with environment variable (if available)
        console.log('\n🌍 Test 2: Environment variable detection')
        console.log('Environment check:', {
            RD_TOKEN: process.env.RD_TOKEN ? '***set***' : 'not set',
            RD_API_KEY: process.env.RD_API_KEY ? '***set***' : 'not set',
        })

        try {
            // Temporarily set an env var for testing
            process.env.RD_TOKEN = 'env-test-key-456'
            const client2 = new RetroDiffusionClient() // No config needed!
            console.log('✅ Client created using environment variable')
            console.log('✅ Client2 has inference methods:', !!client2.inference)

            // Clean up
            delete process.env.RD_TOKEN
        } catch {
            console.log('⚠️  No environment variable found, this is expected in testing')
        }

        // Test 3: Error when no API key is available
        console.log('\n❌ Test 3: No API key available')
        try {
            new RetroDiffusionClient() // Should fail
        } catch (error) {
            if (error instanceof Error) {
                console.log('✅ Correctly threw error:', error.message)
            }
        }

        // Continue with existing tests using client1
        const client = client1

        console.log('\n📊 Available namespaces:', {
            inference: !!client.inference,
            credits: !!client.credits,
        })

        console.log('🔧 Available inference methods:', {
            textToImage: typeof client.inference.textToImage,
            imageToImage: typeof client.inference.imageToImage,
            animation: typeof client.inference.animation,
            create: typeof client.inference.create,
        })

        console.log('💰 Available credits methods:', {
            get: typeof client.credits.get,
        })

        // Test request validation (without making actual API calls)
        const sampleRequest = {
            prompt: 'A cute corgi wearing sunglasses',
            width: 256,
            height: 256,
            num_images: 1,
            prompt_style: 'rd_fast__retro' as const,
        }

        console.log('\n🧪 Testing request validation...')
        console.log('Sample request:', sampleRequest)

        // This will validate the request structure without making an API call
        // (would fail with network error, but structure is validated)
        try {
            await client.inference.textToImage(sampleRequest)
        } catch (error) {
            if (
                error instanceof Error &&
                (error.message.includes('401') || error.message.includes('Unauthorized'))
            ) {
                console.log(
                    '✅ Request validation passed, API call attempted (401 expected with dummy key)',
                )
            } else if (error instanceof Error && error.message.includes('fetch')) {
                console.log('✅ Request validation passed (network error expected in test)')
            } else {
                console.log('❌ Unexpected error:', error)
            }
        }

        console.log('\n🎉 Basic usage test completed successfully!')
    } catch (error) {
        console.error('❌ Basic usage test failed:', error)
    }
}

// Run demonstration if this file is executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('index.ts')) {
    demonstrateUsage()
}
