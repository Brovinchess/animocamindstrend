import { NextResponse } from "next/server";
import { getRequestToken, isConfigured } from "@/lib/twitter-auth";

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Twitter not configured" }, { status: 500 });
  }

  try {
    const { url } = await getRequestToken();
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Twitter auth error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
