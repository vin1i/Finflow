import { prisma } from "../../services/prisma";
export class DeleteCategoryUseCase {
  async execute(id: string) {
    return prisma.category.delete({ where: { id } });
  }
}

export class DeleteAllCategoriesUseCase {
  async execute(userId: string) {
    await prisma.category.deleteMany({ where: { userId } });
  }
}