import { prisma } from "../../services/prisma";
export class ListCategoriesUseCase {
  async execute(userId: string) {
    return prisma.category.findMany({ where: { userId } });
  }
}