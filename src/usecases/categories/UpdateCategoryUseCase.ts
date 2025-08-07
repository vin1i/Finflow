import { UpdateCategoryDTO } from "../../dtos/categories/category.dto";
import { prisma } from "../../services/prisma";
export class UpdateCategoryUseCase {
  async execute(id: string, data: UpdateCategoryDTO) {
    return prisma.category.update({ where: { id }, data });
  }
}