import type { AlertCategory, CategoryResponse } from "@app/shared";
import { prisma } from "~/db/prisma.js";

export async function list(): Promise<CategoryResponse[]> {
  const categories = await prisma.category.findMany();
  return categories.map((category) => ({
    id: category.id,
    code: category.code as AlertCategory,
    label: category.label,
  }));
}
