export type CategoryType = "income" | "expense";


export interface CreateCategoryDTO {
  name: string;
  type: CategoryType;
  userId: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  type: CategoryType;
}