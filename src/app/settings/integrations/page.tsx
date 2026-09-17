import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/badge";
import { PageHeader } from "@/components/page-header";

const integrations = [
  ["Aiven PostgreSQL", "Base de datos, auditoria y persistencia", ["DATABASE_URL", "certs/aiven-ca.pem"]],
  ["Brevo", "Contactos y envio transaccional aprobado", ["BREVO_API_KEY", "BREVO_SENDER_EMAIL"]],
  ["Apify", "Actores y datasets de prospeccion", ["APIFY_TOKEN", "APIFY_DEFAULT_ACTOR_ID"]],
  ["Anthropic", "Agentes, briefs, propuestas y supervision", ["ANTHROPIC_API_KEY", "ANTHROPIC_MODEL"]],
  ["Vercel Cron", "Seguimientos y sincronizaciones programadas", ["CRON_SECRET"]]
];

export default function IntegrationsPage() {
  return (
    <AppShell active="/settings/integrations">
      <PageHeader
        eyebrow="Settings"
        title="Integraciones"
        description="Checklist de variables necesarias para pasar de demo a produccion."
      />
      <section className="panel">
        <div className="panel-body list">
          {integrations.map(([name, description, keys]) => (
            <div className="row" key={String(name)}>
              <div>
                <div className="row-title">{name}</div>
                <div className="row-subtitle">{description}</div>
                <div className="toolbar" style={{ justifyContent: "flex-start", marginTop: 8 }}>
                  {(keys as string[]).map((key) => (
                    <Badge tone="gray" key={key}>{key}</Badge>
                  ))}
                </div>
              </div>
              <Badge tone="amber">pendiente env</Badge>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

