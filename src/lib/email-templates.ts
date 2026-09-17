import type { Lead } from "@/lib/types";
import type { LeadFit } from "@/lib/lead-fit";

export type EmailTemplateKind = "automation" | "web";

export type EmailTemplate = {
  kind: EmailTemplateKind;
  name: string;
  subject: string;
  html: string;
  hook: string;
};

export function selectEmailTemplate(lead: Lead, fit?: Pick<LeadFit, "service">): EmailTemplate {
  return (fit?.service ?? lead.serviceInterest) === "Pagina web" ? webTemplate(lead) : automationTemplate(lead);
}

export function getEmailTemplateExamples(lead?: Lead) {
  const sample = lead ?? {
    id: "sample",
    company: "Empresa ejemplo",
    contactName: "Nombre",
    email: "contacto@empresa.com",
    industry: "Servicios",
    country: "Argentina",
    source: "manual",
    score: 82,
    stage: "qualified",
    serviceInterest: "Paquete mixto",
    lastTouch: new Date().toISOString().slice(0, 10),
    painPoint: "pierden consultas por responder tarde y no tienen una landing que convierta"
  };

  return [automationTemplate(sample), webTemplate(sample)];
}

function automationTemplate(lead: Lead): EmailTemplate {
  const firstName = getFirstName(lead.contactName);
  const hook = "Diagnostico gratis de 20 minutos + mapa de 3 automatizaciones rapidas.";
  return {
    kind: "automation",
    name: "Modelo automatizacion",
    subject: `Idea para ahorrar horas operativas en ${lead.company}`,
    hook,
    html: wrapEmail({
      accent: "#2f7f74",
      preheader: "Una propuesta breve para automatizar consultas, seguimiento y tareas repetitivas.",
      title: `Una automatizacion simple para ${lead.company}`,
      greeting: `${firstName},`,
      intro: `Vi una oportunidad para reducir trabajo manual alrededor de ${lead.painPoint.toLowerCase()}.`,
      bullets: [
        "Responder consultas frecuentes con un asistente IA supervisado.",
        "Clasificar oportunidades y derivarlas al canal correcto.",
        "Crear seguimiento automatico sin perder control humano."
      ],
      hook,
      cta: "Te puedo enviar un diagnostico breve sin costo y 3 quick wins para implementar primero."
    })
  };
}

function webTemplate(lead: Lead): EmailTemplate {
  const firstName = getFirstName(lead.contactName);
  const hook = "Mini auditoria gratis de la web + propuesta de mejora en 48 horas.";
  return {
    kind: "web",
    name: "Modelo web",
    subject: `${lead.company}: una mejora rapida para convertir mas consultas`,
    hook,
    html: wrapEmail({
      accent: "#c6812d",
      preheader: "Una idea concreta para que la web genere mas reuniones y consultas calificadas.",
      title: `Mas consultas desde la web de ${lead.company}`,
      greeting: `${firstName},`,
      intro: `Vi que podria haber margen para mejorar conversion: ${lead.painPoint.toLowerCase()}.`,
      bullets: [
        "Landing o web enfocada en una accion principal.",
        "Mensaje comercial mas claro para visitantes nuevos.",
        "Formulario o WhatsApp conectado a seguimiento comercial."
      ],
      hook,
      cta: "Puedo preparar una mini auditoria gratis y mostrarte que cambiaria primero."
    })
  };
}

function wrapEmail({
  accent,
  preheader,
  title,
  greeting,
  intro,
  bullets,
  hook,
  cta
}: {
  accent: string;
  preheader: string;
  title: string;
  greeting: string;
  intro: string;
  bullets: string[];
  hook: string;
  cta: string;
}) {
  return `
<div style="margin:0;background:#f6f2ea;padding:24px;font-family:Inter,Arial,sans-serif;color:#24211c;">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #ded5c7;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:24px 26px;border-bottom:4px solid ${accent};">
        <div style="font-size:12px;font-weight:700;color:${accent};text-transform:uppercase;">Propuesta breve</div>
        <h1 style="font-size:24px;line-height:1.2;margin:8px 0 0;">${escapeHtml(title)}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 26px;">
        <p style="font-size:16px;line-height:1.55;margin:0 0 14px;">${escapeHtml(greeting)}</p>
        <p style="font-size:16px;line-height:1.55;margin:0 0 18px;">${escapeHtml(intro)}</p>
        <ul style="padding-left:18px;margin:0 0 20px;">
          ${bullets.map((bullet) => `<li style="margin:0 0 8px;line-height:1.5;">${escapeHtml(bullet)}</li>`).join("")}
        </ul>
        <div style="background:#f0eadf;border-radius:10px;padding:14px 16px;margin:0 0 20px;">
          <strong>Oferta gancho:</strong> ${escapeHtml(hook)}
        </div>
        <p style="font-size:16px;line-height:1.55;margin:0 0 22px;">${escapeHtml(cta)}</p>
        <a href="mailto:contacto@tuagencia.com" style="display:inline-block;background:#24211c;color:#fffaf0;text-decoration:none;border-radius:8px;padding:12px 16px;font-weight:700;">Coordinar diagnostico</a>
      </td>
    </tr>
  </table>
</div>`.trim();
}

function getFirstName(contactName: string) {
  const value = contactName.trim();
  if (!value || value.toLowerCase() === "contacto") return "Hola";
  return value.split(/\s+/)[0];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
