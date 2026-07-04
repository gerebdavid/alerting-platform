import { handler } from "~/lib/handler.js";
import * as categoriesService from "~/modules/categories/categories.service.js";

export const listHandler = handler({}, async (_req, res) => {
  const categories = await categoriesService.list();
  res.status(200).json(categories);
});
