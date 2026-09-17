import { NextResponse } from "next/server";
import { findEmailsForMissingLeads } from "@/lib/db/repository";
import { isSimpleAuthed } from "@/lib/simple-auth";

export async function POST() {
  if (!(await isSimpleAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await findEmailsForMissingLeads(25);
  return NextResponse.json(result);
}
