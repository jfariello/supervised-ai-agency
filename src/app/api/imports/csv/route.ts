import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { insertLeads } from "@/lib/db/repository";
import { isLead, normalizeLeadRow } from "@/lib/imports";
import { isSimpleAuthed } from "@/lib/simple-auth";

export async function POST(request: Request) {
  if (!(await isSimpleAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ accepted: 0, rejected: 0, mode: "demo", message: "No file uploaded" });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);
  const normalized = rows.map((row) => normalizeLeadRow(row, file.name.endsWith(".csv") ? "csv" : "excel")).filter(isLead);

  const inserted = await insertLeads(normalized);

  return NextResponse.json({
    accepted: normalized.length,
    rejected: rows.length - normalized.length,
    mode: inserted.mode
  });
}
