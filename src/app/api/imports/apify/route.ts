import { NextResponse } from "next/server";
import { insertLeads } from "@/lib/db/repository";
import { runApifyActor } from "@/lib/integrations/apify";
import { isLead, normalizeLeadRow } from "@/lib/imports";
import { isSimpleAuthed } from "@/lib/simple-auth";

export async function POST() {
  if (!(await isSimpleAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actorId = process.env.APIFY_DEFAULT_ACTOR_ID ?? "demo/lead-scraper";
  const result = await runApifyActor(actorId, {
    maxItems: 25,
    country: "AR",
    query: "empresas que necesitan automatizacion IA"
  });

  const normalized = result.datasetItems.map((item) => normalizeLeadRow(item, "apify")).filter(isLead);
  await insertLeads(normalized);

  return NextResponse.json({
    mode: result.mode,
    runId: result.runId,
    items: normalized.length
  });
}
