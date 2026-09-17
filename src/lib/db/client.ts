import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

let client: postgres.Sql | null = null;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  if (client) return client;

  const caPath = path.join(process.cwd(), "certs", "aiven-ca.pem");
  const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath, "utf8") : undefined;

  client = postgres(process.env.DATABASE_URL, {
    max: Number(process.env.DATABASE_MAX_CONNECTIONS ?? 3),
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: ca ? { ca } : "require"
  });

  return client;
}
