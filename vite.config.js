import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Dev-only middleware so `npm run dev` also serves the /api/parse serverless
// route locally (reading OPENAI_API_KEY from .env); no Vercel CLI required.
// In production, Vercel runs api/parse.js as a real serverless function; this
// plugin is `apply: 'serve'` so it never affects the build.
function devApiRoute(env) {
  return {
    name: 'dev-api-route',
    apply: 'serve',
    configureServer(server) {
      // Expose .env values to the handler's process.env (server-side only;
      // these are NOT bundled into the client).
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }

      server.middlewares.use('/api/parse', async (req, res) => {
        try {
          let body = ''
          for await (const chunk of req) body += chunk
          req.body = body

          const handlerUrl = pathToFileURL(path.resolve(process.cwd(), 'api/parse.js')).href
          const { default: handler } = await import(handlerUrl)
          await handler(req, shimResponse(res))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err?.message || 'dev api error' }))
        }
      })
    },
  }
}

// Adapt a Node ServerResponse to the Vercel-style res.status().json() API.
function shimResponse(res) {
  return {
    setHeader: (k, v) => res.setHeader(k, v),
    status(code) {
      res.statusCode = code
      return this
    },
    json(obj) {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(obj))
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix loads ALL vars (incl. OPENAI_API_KEY) for the dev API route.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), devApiRoute(env)],
    // Honour a PORT env override (used by tooling); default to 5173 locally.
    server: { port: Number(process.env.PORT) || 5173 },
  }
})
