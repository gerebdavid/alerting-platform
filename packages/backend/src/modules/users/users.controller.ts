import { adminUserUpdateSchema } from "@app/shared";
import { z } from "zod";
import { handler } from "~/lib/handler.js";
import * as usersService from "~/modules/users/users.service.js";

const idParamsSchema = z.object({ id: z.string() });

export const listHandler = handler({}, async (_req, res) => {
  const users = await usersService.list();
  res.status(200).json(users);
});

export const updateHandler = handler(
  { params: idParamsSchema, body: adminUserUpdateSchema },
  async (req, res, { params, body }) => {
    const user = await usersService.update(req.user!.userId, params.id, body);
    res.status(200).json(user);
  },
);
