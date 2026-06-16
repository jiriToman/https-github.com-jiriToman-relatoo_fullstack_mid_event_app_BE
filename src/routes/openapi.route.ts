import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Router } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specPath = path.resolve(__dirname, "../../openapi/openapi.json");

function loadSpec() {
  return JSON.parse(readFileSync(specPath, "utf8"));
}

export const openapiRouter = Router();

openapiRouter.get("/openapi.json", (_req, res) => {
  res.json(loadSpec());
});
