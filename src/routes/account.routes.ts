import { FastifyTypedInstance } from "../types/types";
import { authMiddleware } from "../middlewares/auth";
import * as accountController from "../controllers/accountController";
import z from "zod";


export async function accountRoutes(app: FastifyTypedInstance) {

// Todas as rotas que possuem preHandler: [authMiddleware], somente o user autenticado tem autorização em cima da ação da rota
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
                    createdAt: z.string(),
                    updatedAt: z.string()
                })
            }
        }
    }, accountController.createAccount);

    //Listar as contas bancárias do user autenticado

    app.get('/accounts', {
        preHandler: [authMiddleware],
        schema: {
            tags: ['Accounts'],
            description: 'Lista todas as contas bancároas do usuário autenticado',
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    type: z.string(),
                    balance: z.number(),
                    userId: z.string(),
                    createdAt: z.string(),
                    updatedAt: z.string()
                }))
            }
        }
    }, accountController.listAccounts);

    app.patch('/account/:id', {
        preHandler: [authMiddleware],
        schema: {
            tags: ['Accounts'],
            description: 'Atualiza uma conta bancária do usuário autenticado',
            params: z.object({ id: z.string() }),
            body: z.object({
                name: z.string().optional(),
                type: z.string().optional(),
                balance: z.number().optional()
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    name: z.string(),
                    type: z.string(),
                    balance: z.number(),
                    userId: z.string(),
                    createdAt: z.string(),
                    updatedAt: z.string()
                }),
                404: z.object({ message: z.string() })
            }
        }

    }, accountController.updateAccount);


    app.delete('/account/:id', {
        preHandler: [authMiddleware],
        schema: {
            tags: ['Accounts'],
            description: 'Exclui a conta bancária de um usuário autenticado',
            params: z.object({
                id: z.string()
            }),
            response: {
                204: z.undefined(),
                404: z.object({ message: z.string() })
            }
        }
    }, accountController.deleteAccount);



    app.delete('/accounts', {
        preHandler: [authMiddleware],
        schema: {
            tags: ['Accounts'],
            description: 'Exclui todas as contas bancárias do usuário autenticado',
            response: {
                204: z.undefined()
            }
        }
    }, accountController.deleteAllAccounts);
}