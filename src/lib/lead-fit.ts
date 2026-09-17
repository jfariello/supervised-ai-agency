import type { Lead } from "@/lib/types";

export type LeadFit = {
  service: "Automatizacion IA" | "Pagina web" | "Paquete mixto";
  label: string;
  score: number;
  reason: string;
  nextAction: string;
  tone: "teal" | "amber" | "gray";
};

const automationSignals = ["manual", "turno", "consulta", "whatsapp", "recepcion", "derivacion", "seguimiento", "b2b"];
const webSignals = ["web", "sitio", "landing", "convierte", "catalogo", "visitas", "formulario"];

export function getLeadFit(lead: Lead): LeadFit {
  const text = `${lead.serviceInterest} ${lead.industry} ${lead.painPoint}`.toLowerCase();
  const automation = countSignals(text, automationSignals);
  const web = countSignals(text, webSignals);
  const hasEmail = Boolean(lead.email);
  const hasWebsite = Boolean(lead.website);
  const readiness = lead.score + (hasEmail ? 8 : -18) + (hasWebsite ? 4 : 0);

  let service: LeadFit["service"] = lead.serviceInterest;
  if (lead.serviceInterest === "Paquete mixto") {
    service = automation >= web ? "Automatizacion IA" : "Pagina web";
  }

  if (automation > 0 && web > 0 && lead.score >= 70) {
    service = "Paquete mixto";
  }

  const score = Math.max(0, Math.min(100, readiness + automation * 3 + web * 3));
  const label = score >= 78 ? "Prioridad alta" : score >= 58 ? "Viable" : "Revisar antes";
  const tone = score >= 78 ? "teal" : score >= 58 ? "amber" : "gray";
  const reason = buildReason(lead, service, hasEmail, automation, web);
  const nextAction = hasEmail
    ? `Generar email de ${service.toLowerCase()} y dejarlo en aprobacion.`
    : "Primero completar o verificar email publico antes de generar propuesta.";

  return { service, label, score, reason, nextAction, tone };
}

export function getTopLeadFits(leads: Lead[], limit = 5) {
  return leads
    .map((lead) => ({ lead, fit: getLeadFit(lead) }))
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, limit);
}

function countSignals(text: string, signals: string[]) {
  return signals.reduce((count, signal) => count + (text.includes(signal) ? 1 : 0), 0);
}

function buildReason(lead: Lead, service: LeadFit["service"], hasEmail: boolean, automation: number, web: number) {
  const signals = [
    hasEmail ? "tiene email disponible" : "falta validar email",
    `score comercial ${lead.score}`,
    service === "Automatizacion IA" && automation > 0 ? "dolor compatible con automatizacion" : "",
    service === "Pagina web" && web > 0 ? "dolor compatible con web/landing" : "",
    service === "Paquete mixto" ? "hay senales para combinar web y automatizacion" : ""
  ].filter(Boolean);

  return signals.join(", ");
}
