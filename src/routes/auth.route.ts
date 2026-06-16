import { Router } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const authRouter = Router();

function errorResponse(error: string, description: string) {
  return { error, description };
}

/** @openapi
 * /api/auth/login:
 *   post:
 *     operationId: loginAdmin
 *     tags: [auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/LoginRequest" }
 *     responses:
 *       "200":
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/LoginResponse" }
 *       "401": { $ref: "#/components/responses/Unauthorized" }
 */
authRouter.post("/login", (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || typeof password !== "string") {
    res
      .status(400)
      .json(errorResponse("bad_request", "username and password are required"));
    return;
  }

  if (username !== env.adminUsername || password !== env.adminPassword) {
    res
      .status(401)
      .json(errorResponse("unauthorized", "Invalid username or password"));
    return;
  }

  const token = jwt.sign(
    { role: "admin", username },
    env.jwtSecret,
    { expiresIn: "12h" },
  );

  res.json({ token, tokenType: "Bearer" });
});

