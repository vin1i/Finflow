import 'dotenv/config'
import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { registerRoutes } from './routes'

// logger do Fastify só mostra warn/erro (silencia "Server listening...")
const app = fastify({ logger: { level: 'warn' }, trustProxy: true }).withTypeProvider<ZodTypeProvider>()

// Se estiver atrás de proxy (nginx/render/etc), habilite para o req.ip correto:
// app.setTrustProxy(true)
// Zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Plugins
app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'dev-secret' })
app.register(rateLimit, { global: false, ban: 2, enableDraftSpec: true })
app.register(fastifyCors, {
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
})

// Swagger
app.register(fastifySwagger, {
  openapi: {
    info: { title: 'FinFlow Finance', version: '1.0.0' },
    servers: [{ url: '/api' }], // <- prefixo correto no Try it out
  },
  transform: jsonSchemaTransform,
})
app.register(fastifySwaggerUi, { routePrefix: '/api/docs' })

// Rotas
app.register(registerRoutes, { prefix: '/api' })

async function start() {
  try {
    const port = Number(process.env.PORT ?? 3333)
    const host = '0.0.0.0'
    await app.listen({ port, host })

    const baseUrl =
      process.env.PUBLIC_URL ??
      (host === '0.0.0.0' ? `http://localhost:${port}` : `http://${host}:${port}`)

    // Use console.log para aparecer mesmo com logger em 'warn'
    console.log('🚀 HTTP server running!')
    console.log('🔗 Available endpoints:')
    console.log(`   📦 API:        ${baseUrl}/api`)
    console.log(`   📄 Swagger UI: ${baseUrl}/api/docs`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
signals.forEach((sig) => {
  process.on(sig, async () => {
    await app.close()
    process.exit(0)
  })
})

start()
