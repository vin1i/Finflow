import { prisma } from "../../services/prisma";

export class ListTransactionsUseCase {
  async execute(userId: string, filters: any = {}) {
    return prisma.transaction.findMany({
      where: { userId, ...filters },
      orderBy: { date: "desc" }
    });
  }
}