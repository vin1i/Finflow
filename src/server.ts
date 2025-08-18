import 'dotenv/config'
import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'

import { registerRoutes } from './routes'

// Cria o app já tipado com Zod
const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

// Compilers do Zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Plugins
app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'my-ass-secret',
})

app.register(rateLimit, {
  max: 300,                 // req por janela
  timeWindow: '1 minute',   // janela de 1 min
})

app.register(fastifyCors, {
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
})

// Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'FinFlow Finance',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/api/docs', // <- UI ficará em /api/docs
})

// Rotas da aplicação
app.register(registerRoutes, { prefix: '/api' })

// Bootstrap
async function start() {
  try {
    const port = Number(process.env.PORT ?? 3333)
    const host = '0.0.0.0' // <- IMPORTANTE para Docker

    await app.listen({ port, host })

    // URL pública (para logs bonitinhos)
    const baseUrl =
      process.env.PUBLIC_URL ??
      (host === '0.0.0.0' ? `http://localhost:${port}` : `http://${host}:${port}`)

    app.log.info('🚀 HTTP server running!')
    app.log.info('🔗 Available endpoints:')
    app.log.info(`   📦 API:        ${baseUrl}/api`)
    app.log.info(`   📄 Swagger UI: ${baseUrl}/api/docs`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// Encerrar com graça (opcional)
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
signals.forEach((sig) => {
  process.on(sig, async () => {
    await app.close()
    process.exit(0)
  })
})

start()
