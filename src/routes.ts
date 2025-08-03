import z from "zod";
import { FastifyTypedInstance } from "./types";
import { randomUUID } from "node:crypto";
import bcrypt from 'bcryptjs';
import { PrismaClient } from "@prisma/client";
import {authMiddleware} from './middlewares/auth'

interface User {
    id: string
    name: string
    email: string
}

const users: User[] = []
const prisma = new PrismaClient()
export async function routes(app: FastifyTypedInstance) {
    //ROTAS AUTH
    app.post('/register', {
        schema: { 
            tags: ['Auth'],
            description: 'Cadastro de novo usuário',
            body: z.object({ 
                name: z.string(),
                email: z.string().email(),
                password: z.string().min(6)
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string()
                }),
                400: z.object({message: z.string()})
            }
        }
    }, async (request,reply) => { 
        const { name, email, password} = request.body as { name: string, email: string, password: string};
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {name, email, password: hashedPassword}, 
        });
        reply.code(201).send({id: user.id, name: user.name, email: user.email})
    })




    app.post('/login', {
        schema: { 
            tags: ['Auth'],
            description: 'Login do usuário',
            body: z.object({
                email: z.string().email(),
                password:z.string().min(6)
            }),
            response: {
                200: z.object({
                    token: z.string()
                }),
                401: z.object({
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => { 
        const { email, password} = request.body as { email: string, password: string};

        const user = await prisma.user.findUnique({ where: { email}});
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return reply.code(401).send({ message: 'E-mail ou senha inválidos'})
        }

        const token = app.jwt.sign({userId: user.id});
        reply.send({ token})
    })



    //ROTAS USERS
    app.get('/users', {
        schema: {
            tags: ['Users'],
            description: 'List users',
            response: { 
                200: z.array(z.object ({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                }))
            }
        },
    }, async ( request, reply) => {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true}
        })
        return users
    })




    //ROTAS ACCOUNTS - Bank Accounts

    app.post('/accounts', { 
        preHandler: [authMiddleware],
        schema: { 
            tags: ['Accounts'],
            description: 'Criar uma nova conta bancária', 
            body: z.object({ 
                name: z.string(),
                type: z.string(),
                balance: z.number().optional()
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    name: z.string(),
                    type: z.string(),
                    balance: z.number(),
                    userId: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date()
                })
            }
        }
    }, async (request, reply) => {
        const { name, type, balance} = request.body as { name: string, type: string, balance?: number}

        //pega o userId do token JWT
        const userId = ( request as any).user.userId
        const account = await prisma.account.create({
            data: { name, type, balance: balance ?? 0, userId}
        })
        reply.code(201).send(account)
    })

    //Listar as contas bancárias do user autenticado

    app.get('/accounts', { 
        preHandler: [authMiddleware],
        schema: { 
            tags:['Accounts'],
            description: 'Lista todas as contas bancároas do usuário autenticado',
            response: { 
                200: z.array(z.object ({
                    id: z.string(),
                    name: z.string(),
                    type: z.string(),
                    balance: z.number(),
                    userId: z.string(),
                    createdAt: z.date(),
                    updatedAt: z.date()
                }))
            }
        }
    }, async (request, reply) => {
        const userId = (request as any).user.userId
        const accounts = await prisma.account.findMany({ where: { userId}})
        reply.send(accounts)
    }

)}