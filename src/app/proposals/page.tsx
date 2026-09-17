import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/badge";
import { PageHeader } from "@/components/page-header";
import { listEmailDrafts, listLeads, listProposals } from "@/lib/db/repository";
import { getEmailTemplateExamples } from "@/lib/email-templates";
import { requireSimpleAuth } from "@/lib/simple-auth";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  await requireSimpleAuth();

  const [leads, proposals, emailDrafts] = await Promise.all([listLeads(), listProposals(), listEmailDrafts()]);
  const examples = getEmailTemplateExamples(leads[0]);

  return (
    <AppShell active="/proposals">
      <PageHeader
        eyebrow="ProposalAgent"
        title="Propuestas"
        description="Propuestas generadas por IA, editables y siempre sujetas a revision humana."
      />
      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <h2>Modelos de email</h2>
          <Badge tone="teal">HTML preview</Badge>
        </div>
        <div className="panel-body template-grid">
          {examples.map((template) => (
            <div className="template-preview" key={template.kind}>
              <div className="row-title">{template.name}</div>
              <div className="row-subtitle">Asunto: {template.subject}</div>
              <div className="row-subtitle">Oferta: {template.hook}</div>
              <div className="email-preview" dangerouslySetInnerHTML={{ __html: template.html }} />
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-body">
          <table className="table">
            <thead>
              <tr>
                <th>Propuesta</th>
                <th>Lead</th>
                <th>Valor</th>
                <th>Estado</th>
                <th>Actualizada</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => {
                const lead = leads.find((item) => item.id === proposal.leadId);
                return (
                  <tr key={proposal.id}>
                    <td>{proposal.title}</td>
                    <td>{lead ? <Link href={`/leads/${lead.id}`}>{lead.company}</Link> : "Sin lead"}</td>
                    <td>{proposal.value}</td>
                    <td>
                      <Badge>{proposal.status}</Badge>
                    </td>
                    <td>{proposal.updatedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel-header">
          <h2>Borradores de email</h2>
          <Badge>{emailDrafts.length}</Badge>
        </div>
        <div className="panel-body list">
          {emailDrafts.map((draft) => {
            const lead = leads.find((item) => item.id === draft.leadId);
            return (
              <div className="template-preview" key={draft.id}>
                <div className="toolbar" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div className="row-title">{draft.subject}</div>
                    <div className="row-subtitle">
                      {lead ? <Link href={`/leads/${lead.id}`}>{lead.company}</Link> : "Sin lead"}
                    </div>
                  </div>
                  <Badge>{draft.status}</Badge>
                </div>
                <div className="email-preview" dangerouslySetInnerHTML={{ __html: draft.body }} />
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
