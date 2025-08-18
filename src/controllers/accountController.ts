import { FastifyRequest, FastifyReply } from "fastify";
import { AccountType, PrismaClient } from "@prisma/client";
import * as accountService from "../services/accountService";


// Cria uma nova conta bancária
export async function createAccount(request: FastifyRequest, reply: FastifyReply) {
  const { name, type, balance } = request.body as { name: string, type: AccountType, balance?: number };
  const userId = (request as any).user.userId;

  const account = await accountService.createAccount({
    name, type, balance, userId
  });

  reply.code(201).send({
    ...account,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString()
  });
}

// Lista todas as contas do usuário autenticado
export async function listAccounts(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId;
  const accounts = await accountService.getUserAccounts(userId);

  reply.send(
    accounts.map(acc => ({
      ...acc,
      createdAt: acc.createdAt.toISOString(),
      updatedAt: acc.updatedAt.toISOString()
    }))
  );
}

// Atualiza uma conta bancária do usuário autenticado
export async function updateAccount(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const userId = (request as any).user.userId;
  const data = request.body as { name?: string; type?: AccountType; balance?: number };

  const account = await accountService.getAccountById(id);
  if (!account || account.userId !== userId) {
    return reply.code(404).send({ message: "Conta não encontrada" });
  }

  const updated = await accountService.updateAccount(id, data);

  reply.send({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString()
  });
}

// Exclui uma conta bancária do usuário autenticado
export async function deleteAccount(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const userId = (request as any).user.userId;

  const account = await accountService.getAccountById(id);
  if (!account || account.userId !== userId) {
    return reply.code(404).send({ message: "Conta não encontrada" });
  }

  await accountService.deleteAccount(id);
  reply.code(204).send();
}

export async function deleteAllAccounts(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId;
  await accountService.deleteAllAccounts(userId);
  reply.code(204).send();
}