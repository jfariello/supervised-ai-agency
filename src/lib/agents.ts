import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getLeadFit } from "@/lib/lead-fit";
import { selectEmailTemplate } from "@/lib/email-templates";
import type { Brief, EmailDraft, Lead, Proposal } from "@/lib/types";

const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";

const proposalSchema = z.object({
  title: z.string(),
  summary: z.string(),
  value: z.string(),
  emailSubject: z.string(),
  emailBody: z.string()
});

export async function generateCommercialPackage(lead: Lead, brief?: Brief) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return demoPackage(lead, brief);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model,
    max_tokens: 1200,
    system:
      "Sos un equipo de agentes comerciales de una agencia IA. Genera propuestas concretas, sobrias y verificables. No prometas resultados garantizados. El emailBody debe ser HTML completo para email, visualmente agradable, con una oferta gancho clara. Devolve solo JSON valido con title, summary, value, emailSubject y emailBody.",
    messages: [
      {
        role: "user",
        content: `Genera propuesta y email para este lead:\n${JSON.stringify({ lead, brief }, null, 2)}`
      }
    ]
  });

  const text = response.content.find((item) => item.type === "text")?.text ?? "{}";
  const parsed = proposalSchema.parse(JSON.parse(text));
  return {
    proposal: {
      id: `proposal-${lead.id}`,
      leadId: lead.id,
      title: parsed.title,
      status: "needs_review",
      value: parsed.value,
      summary: parsed.summary,
      updatedAt: new Date().toISOString().slice(0, 10)
    } satisfies Proposal,
    email: {
      id: `email-${lead.id}`,
      leadId: lead.id,
      subject: parsed.emailSubject,
      body: parsed.emailBody,
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10)
    } satisfies EmailDraft
  };
}

function demoPackage(lead: Lead, brief?: Brief) {
  const services = brief?.suggestedServices.join(", ") || lead.serviceInterest;
  const fit = getLeadFit(lead);
  const template = selectEmailTemplate(lead, fit);

  return {
    proposal: {
      id: `proposal-${lead.id}`,
      leadId: lead.id,
      title: `Plan ${lead.serviceInterest} para ${lead.company}`,
      status: "needs_review",
      value: lead.score > 75 ? "USD 2.500 - 4.000" : "USD 1.200 - 2.500",
      summary: `Propuesta enfocada en ${services}. Dolor detectado: ${lead.painPoint}`,
      updatedAt: new Date().toISOString().slice(0, 10)
    } satisfies Proposal,
    email: {
      id: `email-${lead.id}`,
      leadId: lead.id,
      subject: template.subject,
      body: template.html,
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10)
    } satisfies EmailDraft
  };
}
