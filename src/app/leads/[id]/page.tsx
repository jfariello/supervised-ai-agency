import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/badge";
import { GeneratePackage } from "@/components/generate-package";
import { PageHeader } from "@/components/page-header";
import {
  getBriefForLead,
  getLead,
  listAgentRunsForLead,
  listEmailDrafts,
  listFollowupsForLead,
  listProposalsForLead
} from "@/lib/db/repository";
import { getLeadFit } from "@/lib/lead-fit";
import { requireSimpleAuth } from "@/lib/simple-auth";
import { stageLabels } from "@/lib/status";
import { saveEmailDraftAction, saveLeadAction, saveProposalAction } from "./actions";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSimpleAuth();

  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const [brief, leadProposals, allEmails, leadRuns, leadFollowups] = await Promise.all([
    getBriefForLead(lead.id),
    listProposalsForLead(lead.id),
    listEmailDrafts(),
    listAgentRunsForLead(lead.id),
    listFollowupsForLead(lead.id)
  ]);
  const leadEmails = allEmails.filter((item) => item.leadId === lead.id);
  const fit = getLeadFit(lead);
  const lowerIndustry = lead.industry.toLowerCase();
  const isOng = lowerIndustry.includes("ong") || lowerIndustry.includes("fundaci") || lowerIndustry.includes("organizacion");

  return (
    <AppShell active="/leads">
      <PageHeader
        eyebrow="Lead"
        title={lead.company}
        description={[lead.email || "Sin email", lead.website, lead.industry].filter(Boolean).join(" - ")}
        actions={<Badge tone={lead.score >= 75 ? "teal" : "amber"}>Score {lead.score}</Badge>}
      />

      <div className="split">
        <div className="grid">
          <section className="panel">
            <div className="panel-header">
              <h2>Resumen</h2>
              <Badge>{stageLabels[lead.stage]}</Badge>
            </div>
            <div className="panel-body">
              <p>{lead.painPoint}</p>
              <div className="grid metrics" style={{ marginTop: 16 }}>
                <div>
                  <h3>Oferta</h3>
                  <p className="muted">{lead.serviceInterest}</p>
                </div>
                <div>
                  <h3>Origen</h3>
                  <p className="muted">{lead.source}</p>
                </div>
                <div>
                  <h3>Web</h3>
                  <p className="muted">{lead.website ?? "Sin web"}</p>
                </div>
                <div>
                  <h3>Telefono</h3>
                  <p className="muted">{lead.phone ?? "Sin telefono"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Preseleccion del agente</h2>
              <Badge tone={fit.tone}>{fit.label}</Badge>
            </div>
            <div className="panel-body grid">
              <div className="grid metrics">
                <div>
                  <h3>Viabilidad</h3>
                  <p className="metric-value" style={{ fontSize: 24 }}>
                    {fit.score}
                  </p>
                </div>
                <div>
                  <h3>Servicio recomendado</h3>
                  <p className="muted">{fit.service}</p>
                </div>
                <div className="full">
                  <h3>Motivo</h3>
                  <p className="muted">{fit.reason}</p>
                </div>
              </div>
              <p>{fit.nextAction}</p>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Datos editables</h2>
              <Badge tone={lead.email ? "teal" : "amber"}>{lead.email ? "email listo" : "falta email"}</Badge>
            </div>
            <div className="panel-body">
              <form className="form-grid" action={saveLeadAction.bind(null, lead.id)}>
                <div className="field">
                  <label htmlFor="company">Empresa</label>
                  <input id="company" name="company" defaultValue={lead.company} required />
                </div>
                <div className="field">
                  <label htmlFor="contactName">Nombre/contacto</label>
                  <input id="contactName" name="contactName" defaultValue={lead.contactName} />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" defaultValue={lead.email} />
                </div>
                <div className="field">
                  <label htmlFor="website">Web</label>
                  <input id="website" name="website" defaultValue={lead.website} />
                </div>
                <div className="field">
                  <label htmlFor="phone">Telefono</label>
                  <input id="phone" name="phone" defaultValue={lead.phone} />
                </div>
                <div className="field">
                  <label htmlFor="industry">Rubro</label>
                  <input id="industry" name="industry" defaultValue={lead.industry} />
                </div>
                <div className="field">
                  <label htmlFor="country">Pais</label>
                  <input id="country" name="country" defaultValue={lead.country} />
                </div>
                <div className="field">
                  <label htmlFor="score">Score</label>
                  <input id="score" name="score" type="number" min="0" max="100" defaultValue={lead.score} />
                </div>
                <div className="field full">
                  <label htmlFor="serviceInterest">Servicio a ofrecer</label>
                  <select id="serviceInterest" name="serviceInterest" defaultValue={lead.serviceInterest}>
                    <option>Automatizacion IA</option>
                    <option>Pagina web</option>
                    <option>Paquete mixto</option>
                  </select>
                </div>
                <div className="field full">
                  <label htmlFor="painPoint">Dolor / oportunidad detectada</label>
                  <textarea id="painPoint" name="painPoint" defaultValue={lead.painPoint} />
                </div>
                <div className="toolbar full">
                  <button className="button" type="submit">
                    Guardar datos
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Flujo recomendado</h2>
              <Badge tone={leadEmails.length ? "teal" : "amber"}>{leadEmails.length ? "borrador listo" : "pendiente"}</Badge>
            </div>
            <div className="panel-body agent-flow">
              <div className="flow-step">
                <strong>1. ResearchAgent</strong>
                <p className="muted">Busca email publico en la web.</p>
              </div>
              <div className="flow-step">
                <strong>2. EmailAgent</strong>
                <p className="muted">Crea un borrador personalizado.</p>
              </div>
              <div className="flow-step">
                <strong>3. Supervisor</strong>
                <p className="muted">Lo deja pendiente en Aprobaciones.</p>
              </div>
              <div className="flow-step">
                <strong>4. Envio</strong>
                <p className="muted">Solo se envia si vos aprobas.</p>
              </div>
            </div>
          </section>

          <GeneratePackage leadId={lead.id} hasEmailDraft={leadEmails.length > 0} context={isOng ? "ong" : "commercial"} />

          <section className="panel">
            <div className="panel-header">
              <h2>Brief</h2>
              <Badge tone={brief ? "teal" : "gray"}>{brief ? "listo" : "pendiente"}</Badge>
            </div>
            <div className="panel-body">
              {brief ? (
                <div className="grid">
                  <p>{brief.context}</p>
                  <p className="muted">{brief.goals}</p>
                  <div className="toolbar" style={{ justifyContent: "flex-start" }}>
                    {brief.suggestedServices.map((service) => (
                      <Badge tone="gray" key={service}>
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="muted">Sin brief todavia. Para ONG, el paso prioritario es revisar el email.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="grid">
          <section className="panel">
            <div className="panel-header">
              <h2>Propuestas</h2>
            </div>
            <div className="panel-body list">
              {leadProposals.length ? (
                leadProposals.map((proposal) => (
                  <form className="edit-card" action={saveProposalAction.bind(null, lead.id, proposal.id)} key={proposal.id}>
                    <div className="toolbar" style={{ justifyContent: "space-between" }}>
                      <Badge>{proposal.status}</Badge>
                      <button className="button secondary" type="submit">
                        Guardar
                      </button>
                    </div>
                    <div className="field">
                      <label htmlFor={`proposal-title-${proposal.id}`}>Titulo</label>
                      <input id={`proposal-title-${proposal.id}`} name="title" defaultValue={proposal.title} />
                    </div>
                    <div className="field">
                      <label htmlFor={`proposal-value-${proposal.id}`}>Valor</label>
                      <input id={`proposal-value-${proposal.id}`} name="value" defaultValue={proposal.value} />
                    </div>
                    <div className="field">
                      <label htmlFor={`proposal-summary-${proposal.id}`}>Propuesta</label>
                      <textarea id={`proposal-summary-${proposal.id}`} name="summary" defaultValue={proposal.summary} />
                    </div>
                  </form>
                ))
              ) : (
                <p className="muted">Para ONG no hace falta propuesta comercial. Prioridad: revisar email.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Emails</h2>
            </div>
            <div className="panel-body list">
              {leadEmails.length ? (
                leadEmails.map((email) => (
                  <form className="edit-card" action={saveEmailDraftAction.bind(null, lead.id, email.id)} key={email.id}>
                    <div className="toolbar" style={{ justifyContent: "space-between" }}>
                      <Badge>{email.status}</Badge>
                      <button className="button secondary" type="submit">
                        Guardar
                      </button>
                    </div>
                    <div className="field">
                      <label htmlFor={`email-subject-${email.id}`}>Asunto</label>
                      <input id={`email-subject-${email.id}`} name="subject" defaultValue={email.subject} />
                    </div>
                    <div className="field">
                      <label htmlFor={`email-body-${email.id}`}>HTML del email</label>
                      <textarea id={`email-body-${email.id}`} name="body" defaultValue={email.body} />
                    </div>
                    <div className="email-preview" dangerouslySetInnerHTML={{ __html: email.body }} />
                  </form>
                ))
              ) : (
                <p className="muted">Todavia no hay borrador. Primero hay que encontrar email publico o cargarlo manualmente.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Seguimiento</h2>
            </div>
            <div className="panel-body list">
              {leadFollowups.length ? (
                leadFollowups.map((followup) => (
                  <div className="row" key={followup.id}>
                    <div>
                      <div className="row-title">{followup.type}</div>
                      <div className="row-subtitle">
                        {followup.dueAt} - {followup.note}
                      </div>
                    </div>
                    <Badge>{followup.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="muted">Sin seguimiento programado.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Trazas</h2>
            </div>
            <div className="panel-body timeline">
              {leadRuns.length ? (
                leadRuns.map((run) => (
                  <div className="timeline-item" key={run.id}>
                    <div className="row-title">{run.agent}</div>
                    <div className="row-subtitle">{run.summary}</div>
                  </div>
                ))
              ) : (
                <p className="muted">Sin trazas para este lead.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
