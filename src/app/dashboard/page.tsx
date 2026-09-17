import { ApprovalActions } from "@/components/approval-actions";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/badge";
import { PageHeader } from "@/components/page-header";
import { Pipeline } from "@/components/pipeline";
import { listAgentRuns, listApprovals, listFollowups, listLeads } from "@/lib/db/repository";
import { requireSimpleAuth } from "@/lib/simple-auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireSimpleAuth();

  const [leads, approvals, followups, agentRuns] = await Promise.all([
    listLeads(),
    listApprovals(),
    listFollowups(),
    listAgentRuns()
  ]);
  const pendingApprovals = approvals.filter((approval) => approval.status === "pending");
  const dueFollowups = followups.filter((followup) => followup.status === "pending");

  return (
    <AppShell active="/dashboard">
      <PageHeader
        eyebrow="Command center"
        title="Agencia IA supervisada"
        description="Pipeline, aprobaciones, agentes y seguimiento en una sola vista."
        actions={
          <>
            <a className="button secondary" href="/imports">
              Importar leads
            </a>
            <a className="button" href="/approvals">
              Revisar pendientes
            </a>
          </>
        }
      />

      <section className="grid metrics" style={{ marginBottom: 16 }}>
        <div className="panel metric">
          <h3>Leads activos</h3>
          <div className="metric-value">{leads.length}</div>
          <div className="metric-note">Excel, CSV, Apify y manual</div>
        </div>
        <div className="panel metric">
          <h3>Aprobaciones</h3>
          <div className="metric-value">{pendingApprovals.length}</div>
          <div className="metric-note">Nada se envia sin revision</div>
        </div>
        <div className="panel metric">
          <h3>Seguimientos</h3>
          <div className="metric-value">{dueFollowups.length}</div>
          <div className="metric-note">Proximos 7 dias</div>
        </div>
        <div className="panel metric">
          <h3>Costo IA demo</h3>
          <div className="metric-value">USD {agentRuns.reduce((sum, run) => sum + run.costUsd, 0).toFixed(2)}</div>
          <div className="metric-note">Trazas auditables</div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Pipeline comercial</h2>
            <Badge tone="teal">supervisado</Badge>
          </div>
          <div className="panel-body">
            <Pipeline leads={leads} />
          </div>
        </section>

        <div className="grid">
          <section className="panel">
            <div className="panel-header">
              <h2>Aprobaciones</h2>
              <Badge tone="amber">{pendingApprovals.length}</Badge>
            </div>
            <div className="panel-body list">
              {pendingApprovals.map((approval) => (
                <div className="row" key={approval.id}>
                  <div className="row-main">
                    <div className="row-title">{approval.title}</div>
                    <div className="row-subtitle">
                      {approval.kind} · riesgo {approval.risk}
                    </div>
                  </div>
                  <ApprovalActions id={approval.id} />
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Actividad de agentes</h2>
              <a className="muted" href="/agent-runs">
                Ver todo
              </a>
            </div>
            <div className="panel-body timeline">
              {agentRuns.map((run) => (
                <div className="timeline-item" key={run.id}>
                  <div className="row-title">{run.agent}</div>
                  <div className="row-subtitle">{run.summary}</div>
                  <div style={{ marginTop: 6 }}>
                    <Badge>{run.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
