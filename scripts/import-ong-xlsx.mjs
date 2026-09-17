import XLSX from "xlsx";
import postgres from "postgres";
import { loadLocalEnv, readAivenCa } from "./lib/env.mjs";

loadLocalEnv();

const file = process.argv[2];
if (!file) throw new Error("Usage: pnpm ong:import <path-to-xlsx>");
const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: readAivenCa() ? { ca: readAivenCa() } : "require"
});

function clean(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

try {
  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  const candidates = rows
    .map((row) => ({
      company: clean(row.title),
      website: clean(row.website),
      phone: clean(row.phone),
      address: clean(row.address),
      industry: clean(row.categoryName) ?? "ONG",
      country: clean(row.countryCode) ?? "AR",
      city: clean(row.city),
      score: clean(row.website) ? 62 : 35
    }))
    .filter((row) => row.company);

  const existing = await sql`
    select lower(coalesce(website, '')) as website, lower(company) as company
    from leads
    where source = 'excel' or website is not null
  `;
  const existingKeys = new Set(existing.map((row) => row.website || `company:${row.company}`));
  const unique = [];

  for (const row of candidates) {
    const key = row.website ? row.website.toLowerCase() : `company:${row.company.toLowerCase()}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    unique.push({
      company: row.company,
      contact_name: "Contacto institucional",
      email: null,
      website: row.website,
      phone: row.phone,
      address: row.address,
      industry: row.industry,
      country: row.country,
      source: "excel",
      score: row.score,
      stage: "new",
      service_interest: "Pagina web",
      last_touch: new Date().toISOString().slice(0, 10),
      pain_point: `ONG importada desde Excel${row.website ? " con sitio web para buscar email de contacto" : " sin sitio web detectado"}.`
    });
  }

  let inserted = 0;
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    if (!batch.length) continue;
    await sql`insert into leads ${sql(batch)}`;
    inserted += batch.length;
  }
  const skipped = candidates.length - inserted;

  await sql`
    insert into agent_runs (agent, status, task, summary, model, cost_usd)
    values ('ProspectorAgent', 'completed', 'Importar ONG desde Excel', ${`Importadas ${inserted} ONG, omitidas ${skipped} duplicadas.`}, 'script', 0)
  `;

  console.log(JSON.stringify({ file, totalRows: rows.length, candidates: candidates.length, inserted, skipped }, null, 2));
} finally {
  await sql.end();
}

