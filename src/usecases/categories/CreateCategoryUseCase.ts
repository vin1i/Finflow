import { CreateCategoryDTO } from "../../dtos/categories/category.dto";
import { prisma } from "../../services/prisma"; // ou crie um client único
export class CreateCategoryUseCase {
  async execute(data: CreateCategoryDTO) {
    return prisma.category.create({ data });
  }
}