import { NextRequest, NextResponse } from "next/server";
import { exchangeToken } from "@/lib/twitter-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const oauthToken = searchParams.get("oauth_token");
  const oauthVerifier = searchParams.get("oauth_verifier");
  const denied = searchParams.get("denied");

  if (denied) {
    return NextResponse.redirect(new URL("/?twitter_error=denied", request.url));
  }

  if (!oauthToken || !oauthVerifier) {
    return NextResponse.redirect(new URL("/?twitter_error=missing_params", request.url));
  }

  try {
    const data = await exchangeToken(oauthToken, oauthVerifier);
    return NextResponse.redirect(
      new URL(`/?twitter_connected=${encodeURIComponent(data.screenName)}`, request.url)
    );
  } catch (err) {
    console.error("Twitter callback error:", err);
    return NextResponse.redirect(new URL("/?twitter_error=exchange_failed", request.url));
  }
}
