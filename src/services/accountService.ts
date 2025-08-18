import { PrismaClient, AccountType } from "@prisma/client";
const prisma = new PrismaClient();

export async function createAccount({ name, type, balance, userId }: { name: string, type: AccountType, balance?: number, userId: string }) {
  return prisma.account.create({
    data: { name, type, balance: balance ?? 0, userId }
  });
}

export async function getUserAccounts(userId: string) {
  return prisma.account.findMany({ where: { userId } });
}

export async function getAccountById(id: string) {
  return prisma.account.findUnique({ where: { id } });
}

export async function updateAccount(id: string, data: { name?: string, type?: AccountType, balance?: number }) {
  return prisma.account.update({ where: { id }, data });
}

export async function deleteAccount(id: string) {
  return prisma.account.delete({ where: { id } });
}

export async function deleteAllAccounts(userId: string) {
  return prisma.account.deleteMany({ where: { userId } });
}