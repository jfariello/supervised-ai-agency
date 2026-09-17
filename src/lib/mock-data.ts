import type { AgentRun, Approval, Brief, EmailDraft, FollowUp, Lead, Proposal } from "@/lib/types";

export const leads: Lead[] = [
  {
    id: "lead-001",
    company: "Norte Solar",
    contactName: "Marina Duarte",
    email: "marina@nortesolar.example",
    industry: "Energia",
    country: "Argentina",
    source: "apify",
    score: 86,
    stage: "email_pending_approval",
    serviceInterest: "Paquete mixto",
    lastTouch: "2026-04-24",
    nextFollowUp: "2026-04-27",
    painPoint: "Reciben consultas web pero no clasifican oportunidades ni responden rapido."
  },
  {
    id: "lead-002",
    company: "Clinica Rivadavia",
    contactName: "Esteban Arias",
    email: "direccion@clinicarivadavia.example",
    industry: "Salud",
    country: "Uruguay",
    source: "excel",
    score: 73,
    stage: "proposal_ready",
    serviceInterest: "Automatizacion IA",
    lastTouch: "2026-04-23",
    nextFollowUp: "2026-04-26",
    painPoint: "Necesitan automatizar turnos, preguntas frecuentes y derivaciones internas."
  },
  {
    id: "lead-003",
    company: "Estudio Mora",
    contactName: "Lucia Fernandez",
    email: "lucia@estudiomora.example",
    industry: "Servicios profesionales",
    country: "Argentina",
    source: "csv",
    score: 64,
    stage: "qualified",
    serviceInterest: "Pagina web",
    lastTouch: "2026-04-22",
    painPoint: "Su sitio no convierte visitas en reuniones."
  },
  {
    id: "lead-004",
    company: "Andes Foods",
    contactName: "Pablo Sosa",
    email: "pablo@andesfoods.example",
    industry: "Alimentos",
    country: "Chile",
    source: "apify",
    score: 58,
    stage: "enriched",
    serviceInterest: "Paquete mixto",
    lastTouch: "2026-04-21",
    painPoint: "Ventas B2B muy manuales y catalogo desactualizado."
  },
  {
    id: "lead-005",
    company: "Metalurgica Prisma",
    contactName: "Carla Ponce",
    email: "carla@prisma.example",
    industry: "Industria",
    country: "Argentina",
    source: "manual",
    score: 49,
    stage: "new",
    serviceInterest: "Automatizacion IA",
    lastTouch: "2026-04-24",
    painPoint: "No hay informacion suficiente todavia."
  }
];

export const briefs: Brief[] = [
  {
    id: "brief-001",
    leadId: "lead-001",
    goals: "Aumentar reuniones calificadas y acelerar respuesta a consultas.",
    context: "Equipo comercial pequeno, alto volumen de consultas por formulario y WhatsApp.",
    urgency: "alta",
    budgetRange: "USD 1.500 - 3.500",
    suggestedServices: ["Landing de conversion", "Agente de calificacion", "CRM liviano"]
  },
  {
    id: "brief-002",
    leadId: "lead-002",
    goals: "Reducir carga administrativa en recepcion.",
    context: "La clinica recibe preguntas repetidas y confirmaciones de turnos por varios canales.",
    urgency: "media",
    budgetRange: "USD 2.000 - 4.000",
    suggestedServices: ["Asistente IA", "Base de conocimiento", "Automatizacion de turnos"]
  }
];

export const proposals: Proposal[] = [
  {
    id: "proposal-001",
    leadId: "lead-001",
    title: "Sistema comercial IA para captar y calificar oportunidades",
    status: "needs_review",
    value: "USD 2.800",
    summary: "Landing optimizada, agente de calificacion y seguimiento automatizado con aprobacion humana.",
    updatedAt: "2026-04-24"
  },
  {
    id: "proposal-002",
    leadId: "lead-002",
    title: "Asistente IA para turnos y consultas frecuentes",
    status: "approved",
    value: "USD 3.200",
    summary: "Automatizacion de recepcion digital, respuestas frecuentes y agenda de seguimiento.",
    updatedAt: "2026-04-23"
  }
];

export const emailDrafts: EmailDraft[] = [
  {
    id: "email-001",
    leadId: "lead-001",
    subject: "Idea concreta para convertir mas consultas en reuniones",
    body: "Marina, vi que Norte Solar podria capturar mejor las consultas entrantes con un flujo de calificacion IA supervisado. Prepare una propuesta breve con una landing y seguimiento comercial.",
    status: "pending",
    createdAt: "2026-04-24"
  },
  {
    id: "email-002",
    leadId: "lead-002",
    subject: "Propuesta aprobada para automatizar consultas de la clinica",
    body: "Esteban, te comparto una propuesta enfocada en reducir carga de recepcion y mejorar la respuesta a pacientes.",
    status: "approved",
    createdAt: "2026-04-23"
  }
];

export const followups: FollowUp[] = [
  {
    id: "follow-001",
    leadId: "lead-001",
    dueAt: "2026-04-27",
    type: "email",
    status: "pending",
    note: "Enviar primer contacto tras aprobar propuesta y email."
  },
  {
    id: "follow-002",
    leadId: "lead-002",
    dueAt: "2026-04-26",
    type: "proposal_review",
    status: "pending",
    note: "Revisar respuesta y ofrecer llamada de diagnostico."
  }
];

export const agentRuns: AgentRun[] = [
  {
    id: "run-001",
    agent: "SupervisorAgent",
    status: "needs_review",
    leadId: "lead-001",
    task: "Validar propuesta y email",
    summary: "Listo para aprobacion. Riesgo bajo, faltan solo ajustes de tono.",
    costUsd: 0.08,
    createdAt: "2026-04-24 18:34"
  },
  {
    id: "run-002",
    agent: "ProspectorAgent",
    status: "completed",
    task: "Importar dataset Apify",
    summary: "32 leads procesados, 7 duplicados evitados, 11 con score mayor a 70.",
    costUsd: 0.03,
    createdAt: "2026-04-24 17:10"
  },
  {
    id: "run-003",
    agent: "ProposalAgent",
    status: "completed",
    leadId: "lead-002",
    task: "Generar propuesta",
    summary: "Propuesta aprobada para automatizacion de turnos.",
    costUsd: 0.11,
    createdAt: "2026-04-23 15:08"
  }
];

export const approvals: Approval[] = [
  {
    id: "approval-001",
    kind: "email",
    objectId: "email-001",
    leadId: "lead-001",
    title: "Email inicial a Norte Solar",
    status: "pending",
    risk: "bajo",
    createdAt: "2026-04-24"
  },
  {
    id: "approval-002",
    kind: "proposal",
    objectId: "proposal-001",
    leadId: "lead-001",
    title: "Propuesta comercial para Norte Solar",
    status: "pending",
    risk: "medio",
    createdAt: "2026-04-24"
  }
];
