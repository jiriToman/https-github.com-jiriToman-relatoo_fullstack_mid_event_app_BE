import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "..");

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Event App API",
      version: "1.0.0",
      description:
        "REST API contract between the Next.js frontend and Express backend.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development",
      },
    ],
  },
  apis: [
    path.join(srcDir, "app.ts"),
    path.join(srcDir, "routes", "*.ts"),
    path.join(srcDir, "openapi", "schemas.ts"),
  ],
};

export function generateOpenApiSpec() {
  return swaggerJsdoc(swaggerOptions);
}
