import type { ApprovalStatus, LeadStage, ProposalStatus } from "@/lib/types";

export const stageLabels: Record<LeadStage, string> = {
  new: "Nuevo",
  enriched: "Enriquecido",
  qualified: "Calificado",
  brief_ready: "Brief listo",
  proposal_ready: "Propuesta",
  email_pending_approval: "Email pendiente",
  contacted: "Contactado",
  follow_up_due: "Seguimiento",
  won: "Ganado",
  lost: "Perdido",
  do_not_contact: "No contactar"
};

export const stageOrder: LeadStage[] = [
  "new",
  "enriched",
  "qualified",
  "proposal_ready",
  "email_pending_approval"
];

export function statusClass(status: ProposalStatus | ApprovalStatus | string) {
  if (["approved", "sent", "completed", "won"].includes(status)) return "teal";
  if (["pending", "needs_review", "running", "queued", "draft"].includes(status)) return "amber";
  if (["rejected", "failed", "lost", "do_not_contact", "overdue"].includes(status)) return "red";
  return "gray";
}
