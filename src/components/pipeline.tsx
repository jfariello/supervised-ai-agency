import Link from "next/link";
import { Badge } from "@/components/badge";
import { stageLabels, stageOrder } from "@/lib/status";
import type { Lead } from "@/lib/types";

export function Pipeline({ leads }: { leads: Lead[] }) {
  return (
    <div className="pipeline">
      {stageOrder.map((stage) => {
        const items = leads.filter((lead) => lead.stage === stage);
        return (
          <section className="stage" key={stage}>
            <div className="stage-title">
              <span>{stageLabels[stage]}</span>
              <Badge tone="gray">{items.length}</Badge>
            </div>
            {items.map((lead) => (
              <Link className="lead-card" href={`/leads/${lead.id}`} key={lead.id}>
                <strong>{lead.company}</strong>
                <div className="lead-meta">{lead.serviceInterest}</div>
                <div className="lead-meta">{lead.contactName}</div>
                <div style={{ marginTop: 8 }}>
                  <Badge tone={lead.score >= 75 ? "teal" : "amber"}>{lead.score}</Badge>
                </div>
              </Link>
            ))}
          </section>
        );
      })}
    </div>
  );
}
