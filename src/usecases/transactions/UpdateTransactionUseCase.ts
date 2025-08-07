import { UpdateTransactionDTO } from "../../dtos/transactions/transaction.dto";
import { prisma } from "../../services/prisma";

export class UpdateTransactionUseCase {
  async execute(id: string, data: UpdateTransactionDTO) {
    return prisma.transaction.update({ where: { id }, data });
  }
}