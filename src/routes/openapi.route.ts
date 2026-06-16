import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Router, type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.resolve(__dirname, "../../openapi/openapi.json");

function loadSpec() {
  return JSON.parse(readFileSync(specPath, "utf8"));
}

export const openapiRouter = Router();

openapiRouter.get("/openapi.json", (_req, res) => {
  res.json(loadSpec());
});

openapiRouter.use("/api-docs", swaggerUi.serve, (_req: Request, res: Response) => {
  res.send(swaggerUi.generateHTML(loadSpec()));
});
