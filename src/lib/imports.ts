import { z } from "zod";
import type { Lead } from "@/lib/types";

const leadImportSchema = z.object({
  company: z.string().min(1),
  contactName: z.string().optional().default("Contacto"),
  email: z.string().email().optional().default(""),
  website: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional().default("Sin clasificar"),
  country: z.string().optional().default("Sin pais"),
  painPoint: z.string().optional().default("Pendiente de investigacion"),
  serviceInterest: z.enum(["Automatizacion IA", "Pagina web", "Paquete mixto"]).optional().default("Paquete mixto")
});

export function normalizeLeadRow(row: Record<string, unknown>, source: Lead["source"]): Lead | null {
  const mapped = {
    company: pick(row, ["company", "empresa", "nombre_empresa", "organization"]),
    contactName: pick(row, ["contactName", "contacto", "nombre", "name"]),
    email: pick(row, ["email", "mail", "correo"]),
    website: pick(row, ["website", "web", "sitio", "url"]),
    phone: pick(row, ["phone", "telefono", "tel"]),
    address: pick(row, ["address", "direccion", "domicilio"]),
    industry: pick(row, ["industry", "rubro", "sector"]),
    country: pick(row, ["country", "pais", "ubicacion"]),
    painPoint: pick(row, ["painPoint", "dolor", "necesidad", "notes"]),
    serviceInterest: pick(row, ["serviceInterest", "servicio", "oferta"])
  };

  const parsed = leadImportSchema.safeParse(mapped);
  if (!parsed.success) return null;

  return {
    id: `lead-${crypto.randomUUID()}`,
    ...parsed.data,
    source,
    score: scoreLead(parsed.data.company, parsed.data.email, parsed.data.painPoint),
    stage: "new",
    lastTouch: new Date().toISOString().slice(0, 10)
  };
}

export function isLead(value: Lead | null): value is Lead {
  return value !== null;
}

function pick(row: Record<string, unknown>, keys: string[]) {
  const found = keys.find((key) => row[key] !== undefined && row[key] !== "");
  return found ? row[found] : undefined;
}

function scoreLead(company: string, email: string, painPoint?: string) {
  let score = 40;
  if (company.length > 3) score += 15;
  if (!email.endsWith("@gmail.com") && !email.endsWith("@hotmail.com")) score += 20;
  if (painPoint && painPoint.length > 20) score += 15;
  return Math.min(score, 95);
}

