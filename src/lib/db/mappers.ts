import type { AgentRun, Approval, Brief, EmailDraft, Lead, Proposal } from "@/lib/types";

type Row = Record<string, any>;

export function mapLead(row: Row): Lead {
  return {
    id: row.id,
    company: row.company,
    contactName: row.contact_name,
    email: row.email ?? "",
    website: row.website ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    industry: row.industry,
    country: row.country,
    source: row.source,
    score: row.score,
    stage: row.stage,
    serviceInterest: row.service_interest,
    lastTouch: formatDate(row.last_touch),
    nextFollowUp: row.next_follow_up ? formatDate(row.next_follow_up) : undefined,
    painPoint: row.pain_point
  };
}

export function mapBrief(row: Row): Brief {
  return {
    id: row.id,
    leadId: row.lead_id,
    goals: row.goals,
    context: row.context,
    urgency: row.urgency,
    budgetRange: row.budget_range,
    suggestedServices: row.suggested_services ?? []
  };
}

export function mapProposal(row: Row): Proposal {
  return {
    id: row.id,
    leadId: row.lead_id,
    title: row.title,
    status: row.status,
    value: row.value,
    summary: row.summary,
    updatedAt: formatDate(row.updated_at)
  };
}

export function mapEmailDraft(row: Row): EmailDraft {
  return {
    id: row.id,
    leadId: row.lead_id,
    subject: row.subject,
    body: row.body,
    status: row.status,
    providerId: row.provider_id ?? undefined,
    createdAt: formatDate(row.created_at)
  };
}

export function mapAgentRun(row: Row): AgentRun {
  return {
    id: row.id,
    agent: row.agent,
    status: row.status,
    leadId: row.lead_id ?? undefined,
    task: row.task,
    summary: row.summary,
    costUsd: Number(row.cost_usd ?? 0),
    createdAt: String(row.created_at).replace("T", " ").slice(0, 16)
  };
}

export function mapApproval(row: Row): Approval {
  return {
    id: row.id,
    kind: row.kind,
    objectId: row.object_id,
    leadId: row.lead_id,
    title: row.title,
    status: row.status,
    risk: row.risk,
    createdAt: formatDate(row.created_at)
  };
}

function formatDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}
