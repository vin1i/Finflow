import { CreateTransactionDTO } from "../../dtos/transactions/transaction.dto";
import { prisma } from "../../services/prisma";

export class CreateTransactionUseCase {
  async execute(data: CreateTransactionDTO) {
    return prisma.transaction.create({ data });
  }
}