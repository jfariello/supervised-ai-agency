import postgres from "postgres";
import { loadLocalEnv, readAivenCa } from "./lib/env.mjs";

loadLocalEnv();

const limit = Number(process.argv[2] ?? 25);
const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: readAivenCa() ? { ca: readAivenCa() } : "require"
});

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const blockedDomains = new Set(["example.com", "sentry.io", "wixpress.com", "squarespace.com"]);
const blockedEmails = new Set([
  "test@mail.com",
  "test@example.com",
  "email@example.com",
  "mail@example.com",
  "info@example.com",
  "noreply@example.com",
  "no-reply@example.com"
]);

function normalizeUrl(url) {
  const text = String(url ?? "").trim();
  if (!text) return null;
  if (text.startsWith("http://") || text.startsWith("https://")) return text;
  return `https://${text}`;
}

function uniqueEmails(text) {
  const found = new Set();
  for (const match of text.match(emailRegex) ?? []) {
    const email = match.toLowerCase().replace(/^mailto:/, "");
    const domain = email.split("@")[1];
    if (blockedEmails.has(email)) continue;
    if (!domain || blockedDomains.has(domain)) continue;
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(email)) continue;
    found.add(email);
  }
  return [...found];
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 AgenciaIA/1.0 email discovery for supervised outreach"
      },
      redirect: "follow"
    });
    if (!response.ok) return "";
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) return "";
    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function contactUrls(baseUrl) {
  const url = new URL(baseUrl);
  const origin = url.origin;
  return [
    baseUrl,
    `${origin}/contacto`,
    `${origin}/contacto/`,
    `${origin}/contact`,
    `${origin}/contact/`,
    `${origin}/quienes-somos`,
    `${origin}/institucional`
  ];
}

try {
  const leads = await sql`
    select id, company, website
    from leads
    where website is not null
      and (email is null or email = '')
      and stage <> 'do_not_contact'
    order by created_at asc
    limit ${limit}
  `;

  let checked = 0;
  let found = 0;

  for (const lead of leads) {
    const base = normalizeUrl(lead.website);
    if (!base) continue;
    checked++;

    const emails = new Set();
    for (const url of contactUrls(base)) {
      const text = await fetchText(url);
      for (const email of uniqueEmails(text)) emails.add(email);
      if (emails.size > 0) break;
    }

    const [email] = [...emails];
    if (!email) continue;

    const duplicate = await sql`select id from leads where email = ${email} and id <> ${lead.id} limit 1`;
    if (duplicate.length) continue;

    await sql`
      update leads
      set email = ${email}, stage = 'enriched', score = greatest(score, 74), updated_at = now(),
          pain_point = ${`Email encontrado en el sitio web. Oportunidad: presentar sitios de referencia para comunidad/ONG.`}
      where id = ${lead.id}
    `;
    found++;
  }

  await sql`
    insert into agent_runs (agent, status, task, summary, model, cost_usd)
    values ('ResearchAgent', 'completed', 'Buscar emails en webs de ONG', ${`Revisadas ${checked} webs. Emails encontrados: ${found}.`}, 'script', 0)
  `;

  console.log(JSON.stringify({ checked, found }, null, 2));
} finally {
  await sql.end();
}
