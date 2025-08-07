import { CategoryType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()



export async function createCategory({ name, type, userId }: { name: string, type: CategoryType, userId: string }) {
  return prisma.category.create({
    data: { name, type, userId }
  });
}

export async function getUserCategories(userId: string) {
  return prisma.category.findMany({ where: { userId } });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function updateCategory(id: string, data: { name?: string, type?: CategoryType }) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
