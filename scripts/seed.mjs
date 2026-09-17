import bcrypt from "bcryptjs";
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
const sql = postgres(process.env.DATABASE_URL, { max: 1, ssl: ca ? { ca } : "require" });

const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const adminName = process.env.SEED_ADMIN_NAME ?? "Admin";

if (!adminEmail || !adminPassword) {
  console.error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required.");
  process.exit(1);
}

try {
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await sql`
    insert into users (name, email, "emailVerified", password_hash, role)
    values (${adminName}, ${adminEmail}, now(), ${passwordHash}, 'admin')
    on conflict (email) do update set
      name = excluded.name,
      "emailVerified" = coalesce(users."emailVerified", now()),
      password_hash = excluded.password_hash,
      role = 'admin'
  `;

  const insertedLeads = await sql`
    insert into leads (company, contact_name, email, industry, country, source, score, stage, service_interest, last_touch, next_follow_up, pain_point)
    values
      ('Norte Solar', 'Marina Duarte', 'marina@nortesolar.example', 'Energia', 'Argentina', 'apify', 86, 'email_pending_approval', 'Paquete mixto', current_date, current_date + interval '3 days', 'Reciben consultas web pero no clasifican oportunidades ni responden rapido.'),
      ('Clinica Rivadavia', 'Esteban Arias', 'direccion@clinicarivadavia.example', 'Salud', 'Uruguay', 'excel', 73, 'proposal_ready', 'Automatizacion IA', current_date - interval '1 day', current_date + interval '2 days', 'Necesitan automatizar turnos, preguntas frecuentes y derivaciones internas.'),
      ('Estudio Mora', 'Lucia Fernandez', 'lucia@estudiomora.example', 'Servicios profesionales', 'Argentina', 'csv', 64, 'qualified', 'Pagina web', current_date - interval '2 days', null, 'Su sitio no convierte visitas en reuniones.')
    on conflict (email) do nothing
    returning id, company
  `;

  const norte = await sql`select id from leads where email = 'marina@nortesolar.example' limit 1`;
  const clinica = await sql`select id from leads where email = 'direccion@clinicarivadavia.example' limit 1`;

  if (norte[0]) {
    await sql`
      insert into briefs (lead_id, goals, context, urgency, budget_range, suggested_services)
      values (${norte[0].id}, 'Aumentar reuniones calificadas y acelerar respuesta a consultas.', 'Equipo comercial pequeno, alto volumen de consultas por formulario y WhatsApp.', 'alta', 'USD 1.500 - 3.500', ${["Landing de conversion", "Agente de calificacion", "CRM liviano"]})
      on conflict do nothing
    `;
    const proposal = await sql`
      insert into proposals (lead_id, title, status, value, summary)
      values (${norte[0].id}, 'Sistema comercial IA para captar y calificar oportunidades', 'needs_review', 'USD 2.800', 'Landing optimizada, agente de calificacion y seguimiento automatizado con aprobacion humana.')
      returning id
    `;
    const email = await sql`
      insert into email_drafts (lead_id, subject, body, status)
      values (${norte[0].id}, 'Idea concreta para convertir mas consultas en reuniones', 'Marina, vi una oportunidad concreta para convertir consultas entrantes en reuniones calificadas con IA supervisada.', 'pending')
      returning id
    `;
    await sql`
      insert into approvals (kind, object_id, lead_id, title, status, risk)
      values
        ('proposal', ${proposal[0].id}, ${norte[0].id}, 'Propuesta comercial para Norte Solar', 'pending', 'medio'),
        ('email', ${email[0].id}, ${norte[0].id}, 'Email inicial a Norte Solar', 'pending', 'bajo')
    `;
  }

  if (clinica[0]) {
    await sql`
      insert into followups (lead_id, due_at, type, status, note)
      values (${clinica[0].id}, current_date + interval '2 days', 'proposal_review', 'pending', 'Revisar respuesta y ofrecer llamada de diagnostico.')
      on conflict do nothing
    `;
  }

  await sql`
    insert into agent_runs (agent, status, task, summary, model, cost_usd)
    values ('ProspectorAgent', 'completed', 'Importar dataset demo', '3 leads demo creados o ya existentes para validar el dashboard.', 'seed', 0)
  `;

  console.log(JSON.stringify({ admin: adminEmail, insertedLeads: insertedLeads.length }, null, 2));
} finally {
  await sql.end();
}
