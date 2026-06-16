import cors from "cors";
import express from "express";

import { requireAdminAuth } from "./middleware/auth.middleware.js";
import { authRouter } from "./routes/auth.route.js";
import { eventsRouter } from "./routes/events.route.js";
import { openapiRouter } from "./routes/openapi.route.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  /**
   * @openapi
   * /:
   *   get:
   *     operationId: getRoot
   *     summary: API welcome
   *     tags: [meta]
   *     responses:
   *       "200":
   *         description: Welcome message
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/WelcomeResponse"
   */
  app.get("/", (_req, res) => {
    res.json({ message: "Event App API" });
  });

  app.use("/api/auth", authRouter);
  app.use(requireAdminAuth);
  app.use("/api/events", eventsRouter);
  app.use(openapiRouter);

  return app;
}
