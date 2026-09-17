"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

export function ApprovalActions({ id }: { id: string }) {
  const [state, setState] = useState<"pending" | "approved" | "rejected">("pending");
  const [busy, setBusy] = useState(false);

  async function decide(decision: "approved" | "rejected") {
    setBusy(true);
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, decision })
    });
    setState(decision);
    setBusy(false);
  }

  if (state !== "pending") {
    return <span className={`badge ${state === "approved" ? "teal" : "red"}`}>{state}</span>;
  }

  return (
    <div className="toolbar">
      <button className="button secondary" disabled={busy} onClick={() => decide("rejected")} title="Rechazar">
        <X size={16} />
      </button>
      <button className="button" disabled={busy} onClick={() => decide("approved")} title="Aprobar">
        <Check size={16} />
      </button>
    </div>
  );
}
