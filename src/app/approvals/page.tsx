import { ApprovalActions } from "@/components/approval-actions";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/badge";
import { PageHeader } from "@/components/page-header";
import { listApprovals, listEmailDrafts, listLeads, listProposals } from "@/lib/db/repository";
import { requireSimpleAuth } from "@/lib/simple-auth";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  await requireSimpleAuth();

  const [approvals, emailDrafts, leads, proposals] = await Promise.all([
    listApprovals(),
    listEmailDrafts(),
    listLeads(),
    listProposals()
  ]);

  return (
    <AppShell active="/approvals">
      <PageHeader
        eyebrow="Human in the loop"
        title="Aprobaciones"
        description="Cola central para propuestas, emails y acciones externas. Nada critico sale sin visto bueno."
      />
      <section className="panel">
        <div className="panel-body list">
          {approvals.map((approval) => {
            const lead = leads.find((item) => item.id === approval.leadId);
            const preview =
              approval.kind === "email"
                ? emailDrafts.find((item) => item.id === approval.objectId)?.body
                : proposals.find((item) => item.id === approval.objectId)?.summary;
            return (
              <div className="row" key={approval.id}>
                <div className="row-main">
                  <div className="row-title">{approval.title}</div>
                  <div className="row-subtitle">
                    {lead?.company} · {approval.kind} · riesgo {approval.risk}
                  </div>
                  <p className="muted" style={{ marginTop: 8 }}>
                    {preview}
                  </p>
                </div>
                <div className="toolbar">
                  <Badge>{approval.status}</Badge>
                  <ApprovalActions id={approval.id} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
