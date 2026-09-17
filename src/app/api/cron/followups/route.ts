import { NextResponse } from "next/server";
import { countDueFollowups } from "@/lib/db/repository";

export async function GET(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  const receivedSecret = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  if (receivedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const queued = await countDueFollowups(today);

  return NextResponse.json({ queued });
}
