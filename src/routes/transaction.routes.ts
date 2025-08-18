import { FastifyTypedInstance } from "../types/types";
import { authMiddleware } from "../middlewares/auth";
import * as transactionController from "../controllers/transactionController";
import z from "zod";

const transactionTypeEnum = z.enum(["income", "expense"]);

export async function transactionRoutes(app: FastifyTypedInstance) {
  app.post('/transaction', {
    preHandler: [authMiddleware],
schema: {
  tags: ['Transactions'],
  description: 'Criar lançamento (receita/despesa)',
  body: z.object({
    amount: z.number().describe('Valor da transação'),
    date: z.string().describe('Data da transação (ISO)'),
    title: z.string().describe('Título da transação'),
    type: transactionTypeEnum.describe('Tipo da transação: income (entrada) ou expense (saída)'),
    description: z.string().optional().describe('Descrição da transação'),
    accountId: z.string().describe('ID da conta'),
    categoryId: z.string().describe('ID da categoria')
  }),
  example: {
    amount: 1000,
    date: "2024-06-01T12:30:00.000Z",
    type: "income",
    title: "Salário de Junho",
    description: "Salário de Junho do trabalho da empresa Bee",
    accountId: "acc-uuid",
    categoryId: "cat-uuid"
},
      response: {
        201: z.object({
          id: z.string(),
          amount: z.number(),
          date: z.string(),
          type: transactionTypeEnum,
          title: z.string(),
          description: z.string().nullable(),
          accountId: z.string(),
          categoryId: z.string(),
          userId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string()
        })
      }
    }
  }, transactionController.createTransaction);

app.get('/transactions', {
  preHandler: [authMiddleware],
  schema: {
    tags: ['Transactions'],
    description: 'Listar transações com filtros',
    querystring: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      categoryId: z.string().optional(),
      type: transactionTypeEnum.optional()
    }),
    response: {
      200: z.array(z.object({
        id: z.string(),
        amount: z.number(),
        date: z.string(),
        type: transactionTypeEnum,
        title: z.string(),
        description: z.string().nullable(),
        accountId: z.string(),
        categoryId: z.string(),
        userId: z.string(),
        createdAt: z.string(),
        updatedAt: z.string()
      }))
    }
  }
}, transactionController.listTransactions);

  app.patch('/transaction/:id', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Transactions'],
      description: 'Atualizar uma transação',
      params: z.object({ id: z.string() }),
      body: z.object({
        amount: z.number().optional().describe('Novo valor'),
        date: z.string().optional().describe('Nova data (ISO)'),
        type: transactionTypeEnum.optional().describe('Novo tipo'),
        title: z.string().describe('Novo título da transação'),
        description: z.string().optional().describe('Nova descrição'),
        accountId: z.string().optional().describe('Nova conta'),
        categoryId: z.string().optional().describe('Nova categoria')
      }),
      response: {
        200: z.object({
          id: z.string(),
          amount: z.number(),
          date: z.string(),
          type: transactionTypeEnum,
          title: z.string(),
          description: z.string().nullable(),
          accountId: z.string(),
          categoryId: z.string(),
          userId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string()
        })
      }
    }
  }, transactionController.updateTransaction);

  app.delete('/transaction/:id', {
    preHandler: [authMiddleware],
    schema: {
      tags: ['Transactions'],
      description: 'Excluir transação',
      params: z.object({ id: z.string() }),
      response: {
        204: z.undefined()
      }
    }
  }, transactionController.deleteTransaction);
}