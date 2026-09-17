"use client";

import { RefreshCw, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ActionState = "idle" | "running" | "done" | "error";

export function LeadAgentControls({ missingEmails, exampleLeads }: { missingEmails: number; exampleLeads: number }) {
  const router = useRouter();
  const [emailState, setEmailState] = useState<ActionState>("idle");
  const [cleanupState, setCleanupState] = useState<ActionState>("idle");
  const [message, setMessage] = useState(
    missingEmails > 0
      ? `${missingEmails} leads tienen web pero todavia no tienen email.`
      : "No hay leads con web pendientes de email."
  );

  async function findEmails() {
    setEmailState("running");
    setMessage("ResearchAgent esta revisando webs y paginas de contacto...");

    try {
      const response = await fetch("/api/agents/email-discovery", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo buscar emails.");

      setEmailState("done");
      setMessage(`ResearchAgent reviso ${data.checked} webs y encontro ${data.found} emails.`);
      router.refresh();
    } catch {
      setEmailState("error");
      setMessage("No se pudo buscar emails. Revisa que los leads tengan web y que el deploy tenga acceso a internet.");
    }
  }

  async function cleanupDemo() {
    const confirmed = window.confirm("Esto borra Norte Solar, Clinica Rivadavia y otros datos demo. Tus ONG importadas quedan.");
    if (!confirmed) return;

    setCleanupState("running");
    setMessage("Limpiando datos de ejemplo...");

    try {
      const response = await fetch("/api/admin/cleanup-demo", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo limpiar demo.");

      setCleanupState("done");
      setMessage(`Se eliminaron ${data.deletedLeads} leads de ejemplo.`);
      router.refresh();
    } catch {
      setCleanupState("error");
      setMessage("No se pudieron limpiar los datos demo.");
    }
  }

  return (
    <section className="panel action-panel">
      <div>
        <div className="eyebrow">ResearchAgent</div>
        <h2>Encontrar emails de los datos cargados</h2>
        <p className="muted">{message}</p>
      </div>
      <div className="toolbar">
        <button className="button" disabled={emailState === "running" || missingEmails === 0} onClick={findEmails}>
          {emailState === "running" ? <RefreshCw className="spin" size={16} /> : <Search size={16} />}
          Buscar emails
        </button>
        <button className="button secondary" disabled={cleanupState === "running" || exampleLeads === 0} onClick={cleanupDemo}>
          {cleanupState === "running" ? <RefreshCw className="spin" size={16} /> : <Trash2 size={16} />}
          Borrar demo
        </button>
      </div>
    </section>
  );
}
