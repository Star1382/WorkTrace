import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

function floatingRoutePlugin() {
  let resolvedConfig

  return {
    name: 'worktrace-floating-route',
    configResolved(config) {
      resolvedConfig = config
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = req.url || ''
        const pathname = requestUrl.split('?')[0]

        if (pathname === '/floating/' || pathname === '/floating/index.html') {
          const htmlPath = resolve(rootDir, 'src/floating/index.html')
          const html = await readFile(htmlPath, 'utf-8')
          const transformed = await server.transformIndexHtml('/src/floating/index.html', html)
          res.setHeader('Content-Type', 'text/html')
          res.end(transformed)
          return
        }

        if (pathname.startsWith('/floating/')) {
          req.url = requestUrl.replace(/^\/floating\//, '/src/floating/')
        }

        next()
      })
    },
    async closeBundle() {
      if (resolvedConfig?.command !== 'build') {
        return
      }

      const sourcePath = resolve(rootDir, 'dist/src/floating/index.html')
      const targetDir = resolve(rootDir, 'dist/floating')
      const targetPath = resolve(targetDir, 'index.html')
      const html = await readFile(sourcePath, 'utf-8')
      await mkdir(targetDir, { recursive: true })
      await writeFile(targetPath, html.replaceAll('../../assets/', '../assets/'), 'utf-8')
      await rm(resolve(rootDir, 'dist/src'), { recursive: true, force: true })
    }
  }
}

export default defineConfig({
  plugins: [floatingRoutePlugin(), react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        floating: resolve(rootDir, 'src/floating/index.html')
      }
    }
  },
  server: {
    port: 5173
  }
})
