const PORT = process.env.PORT || 3000

console.log('Starting Retro Diffusion SDK Basic Example Server...')

Bun.serve({
    port: PORT,
    fetch(req) {
        const url = new URL(req.url)

        // Serve the main HTML file
        if (url.pathname === '/' || url.pathname === '/index.html') {
            const htmlFile = Bun.file('./index.html')
            return new Response(htmlFile, {
                headers: {
                    'Content-Type': 'text/html',
                },
            })
        }

        // Serve files from the dist directory
        if (url.pathname.startsWith('/dist/')) {
            const filePath = `../../${url.pathname.slice(1)}` // Remove leading slash
            const file = Bun.file(filePath)

            return new Response(file, {
                headers: {
                    'Content-Type': url.pathname.endsWith('.js')
                        ? 'application/javascript'
                        : 'text/plain',
                },
            })
        }

        // Return 404 for other paths
        return new Response('Not Found', { status: 404 })
    },
})

console.log(`Server running at http://localhost:${PORT}`)
