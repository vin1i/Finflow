export type TransactionType = "income" | "expense";

export interface CreateTransactionDTO {
  amount: number;
  date: string;
  type: TransactionType;
  title: string;
  description?: string;
  accountId: string;
  categoryId: string;
  userId: string;
}

export interface UpdateTransactionDTO {
  amount?: number;
  date?: string;
  type?: TransactionType;
  title: string;
  description?: string;
  accountId?: string;
  categoryId?: string;
}