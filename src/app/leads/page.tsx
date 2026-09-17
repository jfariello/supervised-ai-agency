import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/badge";
import { LeadAgentControls } from "@/components/lead-agent-controls";
import { PageHeader } from "@/components/page-header";
import { listLeads } from "@/lib/db/repository";
import { getLeadFit, getTopLeadFits } from "@/lib/lead-fit";
import { requireSimpleAuth } from "@/lib/simple-auth";
import { stageLabels } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  await requireSimpleAuth();

  const leads = await listLeads();
  const topFits = getTopLeadFits(leads, 3);
  const missingEmails = leads.filter((lead) => lead.website && !lead.email).length;
  const exampleLeads = leads.filter((lead) =>
    ["Norte Solar", "Clinica Rivadavia", "Estudio Mora", "Andes Foods", "Metalurgica Prisma"].includes(lead.company)
  ).length;

  return (
    <AppShell active="/leads">
      <PageHeader
        eyebrow="CRM"
        title="Leads"
        description="Lista unificada de oportunidades importadas, enriquecidas y supervisadas."
        actions={<a className="button" href="/imports">Nuevo import</a>}
      />
      <LeadAgentControls missingEmails={missingEmails} exampleLeads={exampleLeads} />
      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <h2>Preseleccion recomendada</h2>
          <Badge tone="teal">{topFits.length} candidatos</Badge>
        </div>
        <div className="panel-body list">
          {topFits.map(({ lead, fit }) => (
            <div className="row" key={lead.id}>
              <div className="row-main">
                <div className="row-title">
                  <Link href={`/leads/${lead.id}`}>{lead.company}</Link>
                </div>
                <div className="row-subtitle">
                  {fit.service} - {fit.reason}
                </div>
              </div>
              <div className="toolbar">
                <Badge tone={fit.tone}>{fit.label}</Badge>
                <Badge>{fit.score}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-body">
          <table className="table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contacto</th>
                <th>Email</th>
                <th>Servicio</th>
                <th>Etapa</th>
                <th>Score</th>
                <th>Viabilidad</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const fit = getLeadFit(lead);
                return (
                  <tr key={lead.id}>
                    <td>
                      <Link href={`/leads/${lead.id}`}>
                        <strong>{lead.company}</strong>
                      </Link>
                    </td>
                    <td>{lead.contactName}</td>
                    <td>
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      ) : lead.website ? (
                        <Badge tone="amber">buscar</Badge>
                      ) : (
                        <Badge tone="gray">sin web</Badge>
                      )}
                    </td>
                    <td>{fit.service}</td>
                    <td>{stageLabels[lead.stage]}</td>
                    <td>
                      <Badge tone={fit.tone}>{fit.score}</Badge>
                    </td>
                    <td>{fit.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
