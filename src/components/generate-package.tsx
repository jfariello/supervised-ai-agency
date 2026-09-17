"use client";

import { Bot, CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";

export function GeneratePackage({
  leadId,
  hasEmailDraft,
  context = "commercial"
}: {
  leadId: string;
  hasEmailDraft?: boolean;
  context?: "commercial" | "ong";
}) {
  const [message, setMessage] = useState(
    hasEmailDraft
      ? "Ya existe un borrador para revisar. No hace falta generar otro."
      : context === "ong"
        ? "Crea un borrador para esta ONG. Quedara pendiente de aprobacion y no se enviara solo."
        : "Genera propuesta y email. Quedaran pendientes de aprobacion."
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function generate() {
    setBusy(true);
    setStatus("idle");
    setMessage("Generando... puede tardar unos segundos si usa IA externa.");

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 25000);
      const response = await fetch("/api/agents/proposal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ leadId }),
        signal: controller.signal
      });
      window.clearTimeout(timeout);

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo generar.");

      setMessage(`${data.proposal.title} - ${data.email.subject}`);
      setStatus("success");
    } catch (error) {
      setMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? "La generacion tardo demasiado. Para ONG conviene usar el borrador ya creado y revisar Aprobaciones."
          : "No se pudo generar. Revisa si las variables de IA estan configuradas o usa el borrador existente."
      );
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>{context === "ong" ? "EmailAgent" : "ProposalAgent"}</h2>
        <button className="button" disabled={busy || hasEmailDraft} onClick={generate}>
          {busy ? <Loader2 className="spin" size={16} /> : <Bot size={16} />} Generar
        </button>
      </div>
      <div className="panel-body">
        <p className="muted agent-message">
          {status === "success" ? <CheckCircle2 size={16} /> : status === "error" ? <TriangleAlert size={16} /> : null}
          <span>{message}</span>
        </p>
      </div>
    </div>
  );
}
