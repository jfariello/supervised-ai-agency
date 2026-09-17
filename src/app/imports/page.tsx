import { AppShell } from "@/components/app-shell";
import { ImportForm } from "@/components/import-form";
import { PageHeader } from "@/components/page-header";

export default function ImportsPage() {
  return (
    <AppShell active="/imports">
      <PageHeader
        eyebrow="ProspectorAgent"
        title="Importar y prospectar"
        description="Subi listados Excel/CSV o ejecuta Apify. La normalizacion y deduplicacion quedan auditadas."
      />
      <ImportForm />
    </AppShell>
  );
}
