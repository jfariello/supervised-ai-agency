import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCommercialPackage } from "@/lib/agents";
import { getBriefForLead, getLead, insertCommercialPackage } from "@/lib/db/repository";
import { isSimpleAuthed } from "@/lib/simple-auth";

const requestSchema = z.object({
  leadId: z.string()
});

export async function POST(request: Request) {
  if (!(await isSimpleAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leadId } = requestSchema.parse(await request.json());
  const lead = await getLead(leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const result = await generateCommercialPackage(lead, (await getBriefForLead(leadId)) ?? undefined);
  await insertCommercialPackage(leadId, result.proposal, result.email);

  return NextResponse.json(result);
}
