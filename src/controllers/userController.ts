import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from 'bcryptjs';
import * as userService from "../services/userService";


export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  const { name, email, password } = request.body as { name: string, email: string, password: string };

  const existingUser = await userService.findUserByEmail(email);
  if (existingUser) {
    return reply.code(400).send({ message: "E-mail já cadastrado" });
  }

  // Gera o hash da senha antes de salvar
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userService.createUser({ name, email, password: hashedPassword });
  reply.code(201).send({ id: user.id, name: user.name, email: user.email });
}

export async function loginUser(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as { email: string, password: string };

  const user = await userService.findUserByEmail(email);
  if (!user) {
    console.log('Usuário não encontrado:', email);
    return reply.code(401).send({ message: 'E-mail ou senha inválidos' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    console.log('Senha não confere:', password, 'Hash no banco:', user.password);
    return reply.code(401).send({ message: 'E-mail ou senha inválidos' });
  }

  const token = request.server.jwt.sign({ userId: user.id });
  reply.send({ token });
}

export async function getUsers ( request: FastifyRequest, reply: FastifyReply) {
     const users = await userService.getAllUsers()
        reply.send(users);
}