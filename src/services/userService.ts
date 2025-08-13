import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createUser({ name, email, password }: { name: string, email: string, password: string }) {
  return prisma.user.create({
    data: { name, email, password }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true }
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function deleteUserById(id: string) {
  return prisma.user.delete({ where: { id } });
}