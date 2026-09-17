import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/badge";
import { PageHeader } from "@/components/page-header";
import { listAgentRuns } from "@/lib/db/repository";
import { requireSimpleAuth } from "@/lib/simple-auth";

export const dynamic = "force-dynamic";

export default async function AgentRunsPage() {
  await requireSimpleAuth();

  const agentRuns = await listAgentRuns();

  return (
    <AppShell active="/agent-runs">
      <PageHeader
        eyebrow="Observability"
        title="Trazas de agentes"
        description="Auditoria de tareas, estados, costos estimados y errores de la agencia IA."
      />
      <section className="panel">
        <div className="panel-body">
          <table className="table">
            <thead>
              <tr>
                <th>Agente</th>
                <th>Tarea</th>
                <th>Resumen</th>
                <th>Estado</th>
                <th>Costo</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {agentRuns.map((run) => (
                <tr key={run.id}>
                  <td>{run.agent}</td>
                  <td>{run.task}</td>
                  <td>{run.summary}</td>
                  <td>
                    <Badge>{run.status}</Badge>
                  </td>
                  <td>USD {run.costUsd.toFixed(2)}</td>
                  <td>{run.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
