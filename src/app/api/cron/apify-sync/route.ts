import { NextResponse } from "next/server";

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

  return NextResponse.json({
    mode: process.env.APIFY_TOKEN ? "live" : "demo",
    message: "Apify sync heartbeat recorded"
  });
}
