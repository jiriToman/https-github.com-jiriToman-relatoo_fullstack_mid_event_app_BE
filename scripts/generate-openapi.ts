import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateOpenApiSpec } from "../src/openapi/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../openapi");
const outputPath = path.join(outputDir, "openapi.json");

const spec = generateOpenApiSpec();
mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`OpenAPI spec written to ${outputPath}`);
