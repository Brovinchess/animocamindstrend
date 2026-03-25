import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/reddit-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    // User denied access
    return NextResponse.redirect(new URL("/?reddit_error=denied", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?reddit_error=no_code", request.url));
  }

  try {
    const tokenData = await exchangeCode(code);

    // Redirect back to app with success
    return NextResponse.redirect(
      new URL(`/?reddit_connected=${encodeURIComponent(tokenData.username)}`, request.url)
    );
  } catch (err) {
    console.error("Reddit OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?reddit_error=token_failed", request.url));
  }
}
