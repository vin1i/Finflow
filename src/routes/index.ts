import { FastifyTypedInstance } from "../types/types";
import { accountRoutes } from "./account.routes";
import {userRoutes } from "./user.routes"; 

export async function registerRoutes(app: FastifyTypedInstance) {
  await accountRoutes(app);
  await userRoutes(app);
}