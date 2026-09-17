import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const caPath = path.join(process.cwd(), "certs", "aiven-ca.pem");
const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath, "utf8") : undefined;
const schema = fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8");

const sql = postgres(url, {
  max: 1,
  ssl: ca ? { ca } : "require"
});

try {
  await sql.unsafe(schema);
  console.log("Database schema applied.");
} finally {
  await sql.end();
}
