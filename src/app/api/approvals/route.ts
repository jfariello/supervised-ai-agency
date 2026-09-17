import { NextResponse } from "next/server";
import { z } from "zod";
import { decideApproval } from "@/lib/db/repository";
import { isSimpleAuthed } from "@/lib/simple-auth";

const approvalSchema = z.object({
  id: z.string(),
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().optional()
});

export async function POST(request: Request) {
  if (!(await isSimpleAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = approvalSchema.parse(await request.json());
  const approval = await decideApproval(body.id, body.decision, body.comment);
  return NextResponse.json({ approval });
}
