"use server";

import { revalidatePath } from "next/cache";
import { updateEmailDraft, updateLead, updateProposal } from "@/lib/db/repository";
import { requireSimpleAuth } from "@/lib/simple-auth";
import type { Lead } from "@/lib/types";

export async function saveLeadAction(leadId: string, formData: FormData) {
  await requireSimpleAuth();

  await updateLead(leadId, {
    company: stringValue(formData, "company"),
    contactName: stringValue(formData, "contactName") || "Contacto",
    email: stringValue(formData, "email"),
    website: stringValue(formData, "website"),
    phone: stringValue(formData, "phone"),
    industry: stringValue(formData, "industry") || "Sin clasificar",
    country: stringValue(formData, "country") || "Sin pais",
    score: numberValue(formData, "score"),
    serviceInterest: serviceValue(formData, "serviceInterest"),
    painPoint: stringValue(formData, "painPoint") || "Pendiente de investigacion"
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function saveProposalAction(leadId: string, proposalId: string, formData: FormData) {
  await requireSimpleAuth();

  await updateProposal(proposalId, {
    title: stringValue(formData, "title"),
    value: stringValue(formData, "value"),
    summary: stringValue(formData, "summary")
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/proposals");
  revalidatePath("/approvals");
}

export async function saveEmailDraftAction(leadId: string, draftId: string, formData: FormData) {
  await requireSimpleAuth();

  await updateEmailDraft(draftId, {
    subject: stringValue(formData, "subject"),
    body: stringValue(formData, "body")
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/proposals");
  revalidatePath("/approvals");
}

function stringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key) ?? 0);
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

function serviceValue(formData: FormData, key: string): Lead["serviceInterest"] {
  const value = stringValue(formData, key);
  if (value === "Automatizacion IA" || value === "Pagina web" || value === "Paquete mixto") return value;
  return "Paquete mixto";
}
