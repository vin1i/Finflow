import {fastify} from 'fastify';
import { fastifyCors} from '@fastify/cors';
import {validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform} from 'fastify-type-provider-zod'
import {fastifySwagger} from '@fastify/swagger';
import  {fastifySwaggerUi} from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt';
import { registerRoutes } from './routes/index';
import rateLimit from '@fastify/rate-limit';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)


app.register(fastifyJwt, { 
    secret:process.env.JWT_SECRET || 'my-ass-secret'
})
app.register(rateLimit);
app.register(fastifyCors, {origin: '*'})

app.register(fastifySwagger, { 
    openapi: { 
        info: { 
            title: "FinFlow Finance",
            version: '1.0.0'
        }
    },
    transform:  jsonSchemaTransform,
})

app.register(fastifySwaggerUi, { 
    routePrefix: '/docs'

})


app.register(registerRoutes)

app.listen({ port:3333}).then(() => { 
    const baseUrl = `http://localhost:3333`;
    console.log("🚀 HTTP server running!");
    console.log("🔗 Available endpoints:");
    console.log(`   📦 API:        ${baseUrl}/`);
    console.log(`   📄 Swagger UI: ${baseUrl}/docs`);
})