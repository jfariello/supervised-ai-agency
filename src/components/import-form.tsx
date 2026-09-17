"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

export function ImportForm() {
  const [result, setResult] = useState<string>("Esperando archivo o actor de Apify.");
  const [busy, setBusy] = useState(false);

  async function submitCsv(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/imports/csv", { method: "POST", body: form });
    const data = await response.json();
    setResult(`${data.accepted} leads aceptados, ${data.rejected} rechazados. Modo: ${data.mode}.`);
    setBusy(false);
  }

  async function runApify() {
    setBusy(true);
    const response = await fetch("/api/imports/apify", { method: "POST" });
    const data = await response.json();
    setResult(`Apify ${data.mode}: run ${data.runId}. Items demo/listos: ${data.items}.`);
    setBusy(false);
  }

  return (
    <div className="grid">
      <form className="panel" onSubmit={submitCsv}>
        <div className="panel-header">
          <h2>Excel/CSV</h2>
          <button className="button" disabled={busy} type="submit">
            <Upload size={16} /> Importar
          </button>
        </div>
        <div className="panel-body form-grid">
          <div className="field full">
            <label htmlFor="file">Archivo</label>
            <input accept=".csv,.xlsx" id="file" name="file" type="file" />
          </div>
        </div>
      </form>
      <section className="panel">
        <div className="panel-header">
          <h2>Apify</h2>
          <button className="button secondary" disabled={busy} onClick={runApify}>
            Ejecutar actor
          </button>
        </div>
        <div className="panel-body">
          <p className="muted">{result}</p>
        </div>
      </section>
    </div>
  );
}
