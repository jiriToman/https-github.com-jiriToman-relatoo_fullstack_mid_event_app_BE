import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  mongoUri: requireEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/event_app"),
  adminUsername: requireEnv("ADMIN_USERNAME", "admin"),
  adminPassword: requireEnv("ADMIN_PASSWORD", "admin123"),
  jwtSecret: requireEnv("JWT_SECRET", "change-me-in-production"),
} as const;
