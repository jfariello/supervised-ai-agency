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

const caPath = path.join(process.cwd(), "certs", "aiven-ca.pem");
const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath, "utf8") : undefined;
const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: ca ? { ca } : "require"
});

try {
  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `;
  const leadCount = await sql`select count(*)::int as count from leads`;
  console.log(JSON.stringify({ tables: tables.map((row) => row.table_name), leads: leadCount[0].count }, null, 2));
} finally {
  await sql.end();
}
