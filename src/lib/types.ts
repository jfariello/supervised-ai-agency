export type LeadStage =
  | "new"
  | "enriched"
  | "qualified"
  | "brief_ready"
  | "proposal_ready"
  | "email_pending_approval"
  | "contacted"
  | "follow_up_due"
  | "won"
  | "lost"
  | "do_not_contact";

export type ProposalStatus = "draft" | "needs_review" | "approved" | "sent" | "archived";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type AgentStatus = "queued" | "running" | "completed" | "failed" | "needs_review";

export type Lead = {
  id: string;
  company: string;
  contactName: string;
  email: string;
  website?: string;
  phone?: string;
  address?: string;
  industry: string;
  country: string;
  source: "excel" | "csv" | "apify" | "manual";
  score: number;
  stage: LeadStage;
  serviceInterest: "Automatizacion IA" | "Pagina web" | "Paquete mixto";
  lastTouch: string;
  nextFollowUp?: string;
  painPoint: string;
};

export type Brief = {
  id: string;
  leadId: string;
  goals: string;
  context: string;
  urgency: "baja" | "media" | "alta";
  budgetRange: string;
  suggestedServices: string[];
};

export type Proposal = {
  id: string;
  leadId: string;
  title: string;
  status: ProposalStatus;
  value: string;
  summary: string;
  updatedAt: string;
};

export type EmailDraft = {
  id: string;
  leadId: string;
  subject: string;
  body: string;
  status: ApprovalStatus | "sent";
  providerId?: string;
  createdAt: string;
};

export type FollowUp = {
  id: string;
  leadId: string;
  dueAt: string;
  type: "email" | "call" | "proposal_review" | "research";
  status: "pending" | "done" | "overdue";
  note: string;
};

export type AgentRun = {
  id: string;
  agent: string;
  status: AgentStatus;
  leadId?: string;
  task: string;
  summary: string;
  costUsd: number;
  createdAt: string;
};

export type Approval = {
  id: string;
  kind: "email" | "proposal" | "lead_action";
  objectId: string;
  leadId: string;
  title: string;
  status: ApprovalStatus;
  risk: "bajo" | "medio" | "alto";
  createdAt: string;
};
