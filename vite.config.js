import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function mountVercelHandler(server, route, loader) {
  server.middlewares.use(route, async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost')
    req.query = Object.fromEntries(url.searchParams.entries())

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      req.body = await new Promise((resolve) => {
        let raw = ''
        req.on('data', (chunk) => { raw += chunk })
        req.on('end', () => {
          try {
            resolve(raw ? JSON.parse(raw) : {})
          } catch {
            resolve({})
          }
        })
      })
    } else {
      req.body = {}
    }

    res.status = (code) => {
      res.statusCode = code
      return res
    }
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
      return res
    }

    try {
      const mod = await loader()
      await mod.default(req, res)
    } catch (err) {
      console.error(`Dev API error on ${route}:`, err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }))
      }
    }
  })
}

function localApiPlugin(env) {
  // Populate process.env for api/*.js handlers in Vite dev mode
  Object.assign(process.env, env)

  return {
    name: 'local-api-middleware',
    configureServer(server) {
      mountVercelHandler(server, '/api/auth', () => import('./api/auth.js'))
      mountVercelHandler(server, '/api/sign-upload', () => import('./api/sign-upload.js'))
      mountVercelHandler(server, '/api/delete-image', () => import('./api/delete-image.js'))
      mountVercelHandler(server, '/api/products', () => import('./api/products.js'))
      mountVercelHandler(server, '/api/tags', () => import('./api/tags.js'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localApiPlugin(env)],
  }
})
