import { NextResponse } from "next/server";
import { z } from "zod";
import { getEmailDraft, getLead, markEmailSent } from "@/lib/db/repository";
import { sendBrevoEmail } from "@/lib/integrations/brevo";
import { isSimpleAuthed } from "@/lib/simple-auth";

const sendSchema = z.object({
  draftId: z.string()
});

export async function POST(request: Request) {
  if (!(await isSimpleAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { draftId } = sendSchema.parse(await request.json());
  const draft = await getEmailDraft(draftId);
  if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

  if (draft.status !== "approved") {
    return NextResponse.json({ blocked: true, reason: "Human approval required" }, { status: 409 });
  }

  const lead = await getLead(draft.leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const result = await sendBrevoEmail(lead, draft);

  if (!result.blocked) {
    await markEmailSent(draftId, result.messageId);
  }

  return NextResponse.json(result);
}
