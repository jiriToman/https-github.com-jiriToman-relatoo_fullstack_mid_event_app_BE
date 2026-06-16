import { Router } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     operationId: getHealth
 *     summary: Health check with database status
 *     tags: [meta]
 *     responses:
 *       "200":
 *         description: Service health
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HealthResponse"
 */
healthRouter.get("/", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.json({
    status: "ok",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});
