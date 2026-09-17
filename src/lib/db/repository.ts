import { agentRuns, approvals, briefs, emailDrafts, followups, leads, proposals } from "@/lib/mock-data";
import { getDb } from "@/lib/db/client";
import { mapAgentRun, mapApproval, mapBrief, mapEmailDraft, mapLead, mapProposal } from "@/lib/db/mappers";
import { discoverEmailFromWebsite } from "@/lib/email-discovery";
import type { ApprovalStatus, Brief, EmailDraft, Lead, Proposal } from "@/lib/types";

export type LeadUpdate = Pick<
  Lead,
  "company" | "contactName" | "email" | "website" | "phone" | "industry" | "country" | "score" | "serviceInterest" | "painPoint"
>;

export async function listLeads() {
  const db = getDb();
  if (!db) return leads;
  const rows = await db`select * from leads order by created_at desc`;
  return rows.map(mapLead);
}

export async function findEmailsForMissingLeads(limit = 25) {
  const db = getDb();
  if (!db) return { mode: "demo", checked: 0, found: 0 };

  const candidates = await db`
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

  for (const lead of candidates) {
    checked++;
    const email = await discoverEmailFromWebsite(lead.website);
    if (!email) continue;

    const duplicate = await db`select id from leads where email = ${email} and id <> ${lead.id} limit 1`;
    if (duplicate.length) continue;

    await db`
      update leads
      set email = ${email},
          stage = 'enriched',
          score = greatest(score, 74),
          updated_at = now(),
          pain_point = ${"Email encontrado en el sitio web. Revisar el lead antes de generar el primer contacto."}
      where id = ${lead.id}
    `;
    found++;
  }

  await db`
    insert into agent_runs (agent, status, task, summary, model, cost_usd)
    values ('ResearchAgent', 'completed', 'Buscar emails en webs cargadas', ${`Revisadas ${checked} webs. Emails encontrados: ${found}.`}, 'website-scan', 0)
  `;

  return { mode: "live", checked, found };
}

export async function deleteExampleData() {
  const db = getDb();
  if (!db) {
    leads.length = 0;
    briefs.length = 0;
    proposals.length = 0;
    emailDrafts.length = 0;
    followups.length = 0;
    agentRuns.length = 0;
    approvals.length = 0;
    return { mode: "demo", deletedLeads: 5 };
  }

  const exampleCompanies = ["Norte Solar", "Clinica Rivadavia", "Estudio Mora", "Andes Foods", "Metalurgica Prisma"];
  const deleted = await db`
    delete from leads
    where company = any(${exampleCompanies})
      or email like '%.example'
    returning id
  `;

  await db`
    delete from agent_runs
    where model = 'seed'
       or task ilike '%demo%'
       or summary ilike '%demo%'
  `;

  await db`
    insert into agent_runs (agent, status, task, summary, model, cost_usd)
    values ('SupervisorAgent', 'completed', 'Limpiar datos de ejemplo', ${`Eliminados ${deleted.length} leads demo y sus datos relacionados.`}, 'system', 0)
  `;

  return { mode: "live", deletedLeads: deleted.length };
}

export async function getLead(id: string) {
  const db = getDb();
  if (!db) return leads.find((lead) => lead.id === id) ?? null;
  const rows = await db`select * from leads where id = ${id} limit 1`;
  return rows[0] ? mapLead(rows[0]) : null;
}

export async function getBriefForLead(leadId: string) {
  const db = getDb();
  if (!db) return briefs.find((brief) => brief.leadId === leadId) ?? null;
  const rows = await db`select * from briefs where lead_id = ${leadId} order by created_at desc limit 1`;
  return rows[0] ? mapBrief(rows[0]) : null;
}

export async function listBriefs() {
  const db = getDb();
  if (!db) return briefs;
  const rows = await db`select * from briefs order by created_at desc`;
  return rows.map(mapBrief);
}

export async function listProposals() {
  const db = getDb();
  if (!db) return proposals;
  const rows = await db`select * from proposals order by updated_at desc`;
  return rows.map(mapProposal);
}

export async function listProposalsForLead(leadId: string) {
  const all = await listProposals();
  return all.filter((proposal) => proposal.leadId === leadId);
}

export async function listEmailDrafts() {
  const db = getDb();
  if (!db) return emailDrafts;
  const rows = await db`select * from email_drafts order by created_at desc`;
  return rows.map(mapEmailDraft);
}

export async function getEmailDraft(id: string) {
  const db = getDb();
  if (!db) return emailDrafts.find((draft) => draft.id === id) ?? null;
  const rows = await db`select * from email_drafts where id = ${id} limit 1`;
  return rows[0] ? mapEmailDraft(rows[0]) : null;
}

export async function listFollowups() {
  const db = getDb();
  if (!db) return followups;
  const rows = await db`select * from followups order by due_at asc`;
  return rows.map((row) => ({
    id: row.id,
    leadId: row.lead_id,
    dueAt: String(row.due_at).slice(0, 10),
    type: row.type,
    status: row.status,
    note: row.note
  }));
}

export async function listFollowupsForLead(leadId: string) {
  const all = await listFollowups();
  return all.filter((followup) => followup.leadId === leadId);
}

export async function listAgentRuns() {
  const db = getDb();
  if (!db) return agentRuns;
  const rows = await db`select * from agent_runs order by created_at desc`;
  return rows.map(mapAgentRun);
}

export async function listAgentRunsForLead(leadId: string) {
  const all = await listAgentRuns();
  return all.filter((run) => run.leadId === leadId);
}

export async function listApprovals() {
  const db = getDb();
  if (!db) return approvals;
  const rows = await db`select * from approvals order by created_at desc`;
  return rows.map(mapApproval);
}

export async function decideApproval(id: string, decision: ApprovalStatus, comment?: string) {
  const db = getDb();
  if (!db) return { id, status: decision, comment: comment ?? null };
  const rows = await db`
    update approvals
    set status = ${decision}, comment = ${comment ?? null}, decided_at = now()
    where id = ${id}
    returning *
  `;
  return rows[0] ? mapApproval(rows[0]) : null;
}

export async function insertLeads(items: Lead[]) {
  const db = getDb();
  if (!db || items.length === 0) return { mode: db ? "live" : "demo", count: 0 };

  await db`
    insert into leads ${db(
      items.map((lead) => ({
        company: lead.company,
        contact_name: lead.contactName,
        email: lead.email || null,
        website: lead.website ?? null,
        phone: lead.phone ?? null,
        address: lead.address ?? null,
        industry: lead.industry,
        country: lead.country,
        source: lead.source,
        score: lead.score,
        stage: lead.stage,
        service_interest: lead.serviceInterest,
        last_touch: lead.lastTouch,
        pain_point: lead.painPoint
      }))
    )}
    on conflict (email) do update set
      company = excluded.company,
      contact_name = excluded.contact_name,
      website = coalesce(excluded.website, leads.website),
      phone = coalesce(excluded.phone, leads.phone),
      address = coalesce(excluded.address, leads.address),
      industry = excluded.industry,
      country = excluded.country,
      source = excluded.source,
      score = excluded.score,
      service_interest = excluded.service_interest,
      pain_point = excluded.pain_point,
      updated_at = now()
  `;

  return { mode: "live", count: items.length };
}

export async function updateLead(id: string, values: LeadUpdate) {
  const db = getDb();
  if (!db) {
    const lead = leads.find((item) => item.id === id);
    if (lead) Object.assign(lead, values, { stage: lead.stage });
    return lead ?? null;
  }

  const rows = await db`
    update leads
    set
      company = ${values.company},
      contact_name = ${values.contactName},
      email = ${values.email || null},
      website = ${values.website || null},
      phone = ${values.phone || null},
      industry = ${values.industry},
      country = ${values.country},
      score = ${values.score},
      service_interest = ${values.serviceInterest},
      pain_point = ${values.painPoint},
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return rows[0] ? mapLead(rows[0]) : null;
}

export async function updateProposal(id: string, values: Pick<Proposal, "title" | "value" | "summary">) {
  const db = getDb();
  if (!db) {
    const proposal = proposals.find((item) => item.id === id);
    if (proposal) Object.assign(proposal, values, { updatedAt: new Date().toISOString().slice(0, 10) });
    return proposal ?? null;
  }

  const rows = await db`
    update proposals
    set title = ${values.title}, value = ${values.value}, summary = ${values.summary}, updated_at = now()
    where id = ${id}
    returning *
  `;
  return rows[0] ? mapProposal(rows[0]) : null;
}

export async function updateEmailDraft(id: string, values: Pick<EmailDraft, "subject" | "body">) {
  const db = getDb();
  if (!db) {
    const draft = emailDrafts.find((item) => item.id === id);
    if (draft) Object.assign(draft, values, { status: "pending" });
    return draft ?? null;
  }

  const rows = await db`
    update email_drafts
    set subject = ${values.subject}, body = ${values.body}, status = 'pending'
    where id = ${id}
    returning *
  `;
  return rows[0] ? mapEmailDraft(rows[0]) : null;
}

export async function insertCommercialPackage(leadId: string, proposal: Proposal, email: EmailDraft) {
  const db = getDb();
  if (!db) return;

  const proposalRows = await db`
    insert into proposals (lead_id, title, status, value, summary)
    values (${leadId}, ${proposal.title}, ${proposal.status}, ${proposal.value}, ${proposal.summary})
    returning id
  `;

  const emailRows = await db`
    insert into email_drafts (lead_id, subject, body, status)
    values (${leadId}, ${email.subject}, ${email.body}, ${email.status})
    returning id
  `;

  await db`
    insert into approvals (kind, object_id, lead_id, title, status, risk)
    values
      ('proposal', ${proposalRows[0].id}, ${leadId}, ${proposal.title}, 'pending', 'medio'),
      ('email', ${emailRows[0].id}, ${leadId}, ${email.subject}, 'pending', 'bajo')
  `;

  await db`
    insert into agent_runs (agent, status, lead_id, task, summary, model, cost_usd)
    values ('ProposalAgent', 'needs_review', ${leadId}, 'Generate proposal and email draft', 'Generated proposal and email draft. Waiting for human approval.', ${process.env.ANTHROPIC_MODEL ?? "demo"}, 0)
  `;
}

export async function markEmailSent(id: string, providerId?: string) {
  const db = getDb();
  if (!db) return;
  await db`update email_drafts set status = 'sent', provider_id = ${providerId ?? null} where id = ${id}`;
}

export async function countDueFollowups(today: string) {
  const db = getDb();
  if (!db) return followups.filter((followup) => followup.status === "pending" && followup.dueAt <= today).length;
  const rows = await db`select count(*)::int as count from followups where due_at <= ${today} and status = 'pending'`;
  return Number(rows[0]?.count ?? 0);
}

