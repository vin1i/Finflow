import { prisma } from "../../services/prisma";

export class DeleteTransactionUseCase {
  async execute(id: string) {
    return prisma.transaction.delete({ where: { id } });
  }
}