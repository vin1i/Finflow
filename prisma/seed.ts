import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Usuário
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@mail.com",
      password: "secret123",
    },
  });

  // Contas
  const account = await prisma.account.create({
    data: {
      name: "Banco XP",
      type: "checking",
      balance: 2000,
      userId: user.id,
    },
  });

  // Categorias
  const categoryIncome = await prisma.category.create({
    data: {
      name: "Salário",
      type: "income",
      userId: user.id,
    },
  });
  const categoryExpense = await prisma.category.create({
    data: {
      name: "Mercado",
      type: "expense",
      userId: user.id,
    },
  });

  // Transações
  await prisma.transaction.createMany({
    data: [
      {
        amount: 2000,
        date: new Date("2025-08-07T00:00:00.000Z"),
        type: "income",
        title: "Recebimento salário",
        description: "Salário mensal",
        accountId: account.id,
        categoryId: categoryIncome.id,
        userId: user.id,
      },
      {
        amount: 300,
        date: new Date("2025-08-08T00:00:00.000Z"),
        type: "expense",
        title: "Compra mercado",
        description: "Supermercado",
        accountId: account.id,
        categoryId: categoryExpense.id,
        userId: user.id,
      },
    ],
  });

  // Orçamento (Budget)
  await prisma.budget.create({
    data: {
      amount: 500,
      month: 8,
      year: 2025,
      categoryId: categoryExpense.id,
      userId: user.id,
    },
  });

  // Meta (Goal)
  await prisma.goal.create({
  data: {
    name: "Viagem",
    target: 3000,
    deadline: new Date("2025-12-31"),
    userId: user.id,
  },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());