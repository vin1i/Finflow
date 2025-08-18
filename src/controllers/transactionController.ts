import { FastifyRequest, FastifyReply } from "fastify";
import { CreateTransactionUseCase } from "../usecases/transactions/CreateTransactionUseCase";
import { ListTransactionsUseCase } from "../usecases/transactions/ListTransactionsUseCase";
import { UpdateTransactionUseCase } from "../usecases/transactions/UpdateTransactionUseCase";
import { DeleteTransactionUseCase } from "../usecases/transactions/DeleteTransactionUseCase";
import { CreateTransactionDTO, UpdateTransactionDTO } from "../dtos/transactions/transaction.dto";
import { prisma } from "../services/prisma";
// POST /transactions
export async function createTransaction(request: FastifyRequest, reply: FastifyReply) {
  const { amount, date, type, title, description, accountId, categoryId } = request.body as CreateTransactionDTO;
  const userId = (request as any).user.userId;

  // Buscar categoria e validar tipo
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return reply.code(400).send({ message: "Categoria não encontrada" });
  }
  if (category.type !== type) {
    return reply.code(400).send({ message: "Tipo da transação deve ser igual ao tipo da categoria" });
  }

  // Buscar conta e atualizar saldo
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    return reply.code(400).send({ message: "Conta não encontrada" });
  }

  let newBalance = account.balance;
  if (type === "income") {
    newBalance += amount;
  } else if (type === "expense") {
    newBalance -= amount;
  }

  await prisma.account.update({
    where: { id: accountId },
    data: { balance: newBalance }
  });

  const useCase = new CreateTransactionUseCase();
  const transaction = await useCase.execute({ amount, date, type, title, description, accountId, categoryId, userId });
  reply.code(201).send({
    ...transaction,
    title: transaction.title,
    description: transaction.description ?? null,
    date: transaction.date.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString()
  });
}
// GET /transactions
export async function listTransactions(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId;
  const { startDate, endDate, categoryId, type } = request.query as {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    type?: string;
  };

  const filters: any = {};
  if (startDate && endDate) {
    filters.date = { gte: new Date(startDate), lte: new Date(endDate) };
  } else if (startDate) {
    filters.date = { gte: new Date(startDate) };
  } else if (endDate) {
    filters.date = { lte: new Date(endDate) };
  }
  if (categoryId) {
    filters.categoryId = categoryId;
  }
  if (type) {
    filters.type = type;
  }

  const useCase = new ListTransactionsUseCase();
  const transactions = await useCase.execute(userId, filters);
reply.send(
  transactions.map(tx => ({
    id: tx.id,
    amount: tx.amount,
    date: tx.date instanceof Date ? tx.date.toISOString() : tx.date,
    type: tx.type,
    title: tx.title,
    description: tx.description ?? null,
    accountId: tx.accountId,
    categoryId: tx.categoryId,
    userId: tx.userId,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
    updatedAt: tx.updatedAt instanceof Date ? tx.updatedAt.toISOString() : tx.updatedAt
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
  id: updated.id,
  amount: updated.amount,
  date: updated.date instanceof Date ? updated.date.toISOString() : updated.date,
  type: updated.type,
  title: updated.title,
  description: updated.description ?? null,
  accountId: updated.accountId,
  categoryId: updated.categoryId,
  userId: updated.userId,
  createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
  updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : updated.updatedAt
  });
}

// DELETE /transaction/:id
export async function deleteTransaction(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };

  // Buscar transação antes de deletar
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) {
    return reply.code(404).send({ message: "Transação não encontrada" });
  }

  // Buscar conta associada
  const account = await prisma.account.findUnique({ where: { id: transaction.accountId } });
  if (!account) {
    return reply.code(404).send({ message: "Conta não encontrada" });
  }

  let newBalance = account.balance;
  if (transaction.type === "income") {
    newBalance -= transaction.amount;
  } else if (transaction.type === "expense") {
    newBalance += transaction.amount;
  }

  await prisma.account.update({
    where: { id: account.id },
    data: { balance: newBalance }
  });

  // Deletar transação
  const useCase = new DeleteTransactionUseCase();
  await useCase.execute(id);
  reply.code(204).send();
}