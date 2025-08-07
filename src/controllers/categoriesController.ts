import { FastifyRequest, FastifyReply } from "fastify";
import { CreateCategoryUseCase } from "../usecases/categories/CreateCategoryUseCase";
import { ListCategoriesUseCase } from "../usecases/categories/ListCategoriesUseCase";
import { UpdateCategoryUseCase } from "../usecases/categories/UpdateCategoryUseCase";
import { DeleteAllCategoriesUseCase, DeleteCategoryUseCase } from "../usecases/categories/DeleteCategoryUseCase";
import { CategoryType, CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/categories/category.dto";

// Criar nova categoria
const allowedTypes: readonly CategoryType[] = ["income", "expense"];

export async function createCategory(request: FastifyRequest, reply: FastifyReply) {
  const { name, type } = request.body as { name: string, type: CategoryType };
  const userId = (request as any).user.userId;

  if (!allowedTypes.includes(type)) {
    return reply.code(400).send({ message: "Tipo de categoria inválido. Use 'income' ou 'expense'." });
  }

  const useCase = new CreateCategoryUseCase();
  const category = await useCase.execute({ name, type, userId });
  reply.code(201).send({
    ...category,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  });
}
// Listar categorias do usuário logado
export async function listCategories(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId;
  const useCase = new ListCategoriesUseCase();
  const categories = await useCase.execute(userId);
  reply.send( 
  categories.map(category => ({ 
    ...category,
     createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  }))
  );
}

// Atualizar nome ou tipo da categoria
export async function updateCategory(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const userId = (request as any).user.userId;
  const data = request.body as UpdateCategoryDTO;

  if (data.type && !allowedTypes.includes(data.type)) {
    return reply.code(400).send({ message: "Tipo de categoria inválido. Use 'income' ou 'expense'." });
  }

  const useCase = new UpdateCategoryUseCase();
  const updated = await useCase.execute(id, data);

  reply.send({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString()
  });
}

// Remover categoria
export async function deleteCategory(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const userId = (request as any).user.userId;

  // Aqui você pode buscar a categoria antes, se quiser validar o userId
  const useCase = new DeleteCategoryUseCase();
  await useCase.execute(id);
  reply.code(204).send();
}

//Remover todas as categorias
export async function deleteAllCategories(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId;
  const useCase = new DeleteAllCategoriesUseCase();
  await useCase.execute(userId);
  reply.code(204).send();
}