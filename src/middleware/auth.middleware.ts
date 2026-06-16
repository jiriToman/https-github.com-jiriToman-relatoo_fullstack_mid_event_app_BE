import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

type AuthPayload = {
  role: "admin";
  username: string;
};

function errorResponse(error: string, description: string) {
  return { error, description };
}

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res
      .status(401)
      .json(errorResponse("unauthorized", "Missing Bearer token"));
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    if (payload.role !== "admin") {
      res.status(403).json(errorResponse("forbidden", "Admin role required"));
      return;
    }
    next();
  } catch {
    res.status(401).json(errorResponse("unauthorized", "Invalid token"));
  }
}

