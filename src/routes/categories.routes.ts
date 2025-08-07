import { FastifyTypedInstance } from "../types/types";
import { authMiddleware } from "../middlewares/auth";
import * as categoriesController from "../controllers/categoriesController";
import z from "zod";

const categoryTypeEnum = z.enum(["income", "expense"]);

export async function categoriesRoutes(app: FastifyTypedInstance) {
  app.post('/category', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Categories'],
      description: 'Criar nova categoria',
      body: z.object({
        name: z.string().describe('Nome da categoria'),
        type: categoryTypeEnum.describe('Tipo da categoria: income (receita) ou expense (despesa)')
      }),
      response: {
        201: z.object({
          id: z.string(),
          name: z.string(),
          type: categoryTypeEnum,
          userId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string()
        })
      },
      example: {
        name: "Salário",
        type: "income"
      }
    }
  }, categoriesController.createCategory);

  app.get('/categories', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Categories'],
      description: 'Listar categorias do usuário logado',
      response: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          type: categoryTypeEnum,
          userId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string()
        }))
      }
    }
  }, categoriesController.listCategories);

  app.patch('/category/:id', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Categories'],
      description: 'Atualizar nome ou tipo da categoria',
      params: z.object({ id: z.string() }),
      body: z.object({
        name: z.string().optional().describe('Novo nome da categoria'),
        type: categoryTypeEnum.optional().describe('Novo tipo da categoria')
      }),
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
          type: categoryTypeEnum,
          userId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string()
        }),
        404: z.object({ message: z.string() })
      }
    }
  }, categoriesController.updateCategory);

  app.delete('/category/:id', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Categories'],
      description: 'Remover categoria',
      params: z.object({ id: z.string() }),
      response: {
        204: z.undefined(),
        404: z.object({ message: z.string() })
      }
    }
  }, categoriesController.deleteCategory);

  app.delete('/categories/all', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Categories'],
      description: 'Remove todas as categorias do usuário autenticado',
      response: {
        204: z.undefined()
      }
    }
  }, categoriesController.deleteAllCategories);
}