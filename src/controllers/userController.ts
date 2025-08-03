import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from 'bcryptjs';
import * as userService from "../services/userService";


export async function createUser (request: FastifyRequest, reply: FastifyReply) { 
     const { name, email, password} = request.body as { name: string, email: string, password: string};

        const user = await userService.createUser({name, email, password});
        reply.code(201).send({id: user.id, name: user.name, email: user.email})
}

export async function loginUser ( request: FastifyRequest, reply: FastifyReply) {

 const { email, password} = request.body as { email: string, password: string};

        const user = await userService.findUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return reply.code(401).send({ message: 'E-mail ou senha inválidos'})
        }

        const token = request.server.jwt.sign({userId: user.id});
        reply.send({ token})


}

export async function getUsers ( request: FastifyRequest, reply: FastifyReply) {
     const users = await userService.getAllUsers()
        reply.send(users);
}