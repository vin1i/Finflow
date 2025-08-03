import z from "zod";
import { FastifyTypedInstance } from "../types/types";
import * as userController from "../controllers/userController";


export async function userRoutes(app: FastifyTypedInstance) {
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
    }, userController.createUser)




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
    }, userController.loginUser)



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
    }, userController.getUsers)

}