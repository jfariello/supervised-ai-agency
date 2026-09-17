import postgres from "postgres";
import { loadLocalEnv, readAivenCa } from "./lib/env.mjs";

loadLocalEnv();

const limit = Number(process.argv[2] ?? 25);
const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: readAivenCa() ? { ca: readAivenCa() } : "require"
});

function emailBody(company) {
  return `Hello ${company} team,

I noticed an opportunity to improve your digital presence and streamline how incoming inquiries are handled.

I prepared a short idea focused on improving conversion, qualification and follow-up while keeping human approval in the loop.

If useful, I can share the proposal for review.

Best regards,
AI Sales Team`;
}

try {
  const leads = await sql`
    select id, company, email
    from leads
    where email is not null
      and email <> ''
      and stage <> 'do_not_contact'
      and not exists (
        select 1 from email_drafts
        where email_drafts.lead_id = leads.id
          and email_drafts.subject = 'Digital growth opportunity'
      )
    order by updated_at desc
    limit ${limit}
  `;

  let created = 0;

  for (const lead of leads) {
    const draft = await sql`
      insert into email_drafts (lead_id, subject, body, status)
      values (
        ${lead.id},
        'Digital growth opportunity',
        ${emailBody(lead.company)},
        'pending'
      )
      returning id
    `;

    await sql`
      insert into approvals (kind, object_id, lead_id, title, status, risk)
      values (
        'email',
        ${draft[0].id},
        ${lead.id},
        ${`Email draft for ${lead.company}`},
        'pending',
        'bajo'
      )
    `;

    created++;
  }

  await sql`
    insert into agent_runs (agent, status, task, summary, model, cost_usd)
    values (
      'EmailAgent',
      'needs_review',
      'Create outreach drafts',
      ${`Created ${created} drafts pending human approval.`},
      'script',
      0
    )
  `;

  console.log(JSON.stringify({ created }, null, 2));
} finally {
  await sql.end();
}
