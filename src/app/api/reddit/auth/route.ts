import { NextResponse } from "next/server";
import { getAuthUrl, isConfigured } from "@/lib/reddit-auth";
import { randomBytes } from "crypto";

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Reddit OAuth not configured. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env.local" },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const url = getAuthUrl(state);

  // Redirect to Reddit's authorization page
  return NextResponse.redirect(url);
}
