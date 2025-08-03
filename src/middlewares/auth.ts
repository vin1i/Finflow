import { FastifyReply, FastifyRequest } from "fastify";

export async function authMiddleware(request: FastifyRequest, reply:FastifyReply) { 
    try {
        await request.jwtVerify()
    } catch (err) {
        return reply.status(401).send({ message: "Não autorizado: token JWT ausente ou inválido." })
    }
}

