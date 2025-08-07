import { FastifyTypedInstance } from "../types/types";
import { accountRoutes } from "./account.routes";
import { categoriesRoutes } from "./categories.routes";
import { transactionRoutes } from "./transaction.routes";
import {userRoutes } from "./user.routes"; 

export async function registerRoutes(app: FastifyTypedInstance) {
  await userRoutes(app);
  await accountRoutes(app);
  await categoriesRoutes(app);
  await transactionRoutes(app);
}