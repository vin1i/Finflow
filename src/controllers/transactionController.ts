import { FastifyRequest, FastifyReply } from "fastify";
import { CreateTransactionUseCase } from "../usecases/transactions/CreateTransactionUseCase";
import { ListTransactionsUseCase } from "../usecases/transactions/ListTransactionsUseCase";
import { UpdateTransactionUseCase } from "../usecases/transactions/UpdateTransactionUseCase";
import { DeleteTransactionUseCase } from "../usecases/transactions/DeleteTransactionUseCase";
import { CreateTransactionDTO, UpdateTransactionDTO } from "../dtos/transactions/transaction.dto";
import { prisma } from "../services/prisma";
// POST /transactions
export async function createTransaction(request: FastifyRequest, reply: FastifyReply) {
  const { amount, date, type, description, accountId, categoryId } = request.body as CreateTransactionDTO;
  const userId = (request as any).user.userId;

  // Buscar categoria e validar tipo
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return reply.code(400).send({ message: "Categoria não encontrada" });
  }
  if (category.type !== type) {
    return reply.code(400).send({ message: "Tipo da transação deve ser igual ao tipo da categoria" });
  }

  const useCase = new CreateTransactionUseCase();
  const transaction = await useCase.execute({ amount, date, type, description, accountId, categoryId, userId });
reply.code(201).send({
  ...transaction,
  date: transaction.date.toISOString(), 
  description: transaction.description ?? null,
  createdAt: transaction.createdAt.toISOString(),
  updatedAt: transaction.updatedAt.toISOString()
});
}

// GET /transactions
export async function listTransactions(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId;
  // Adapte para aceitar filtros via querystring se desejar
  const useCase = new ListTransactionsUseCase();
  const transactions = await useCase.execute(userId);
  reply.send(
    transactions.map(tx => ({
      ...tx,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString()
    }))
  );
}

// PATCH /transaction/:id
export async function updateTransaction(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const data = request.body as UpdateTransactionDTO;
  const useCase = new UpdateTransactionUseCase();
  const updated = await useCase.execute(id, data);
  reply.send({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString()
  });
}

// DELETE /transaction/:id
export async function deleteTransaction(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const useCase = new DeleteTransactionUseCase();
  await useCase.execute(id);
  reply.code(204).send();
}