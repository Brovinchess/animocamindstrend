import { NextRequest, NextResponse } from "next/server";
import { postThread, isConnected } from "@/lib/twitter-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { screenName, tweets } = body;

    if (!screenName || !tweets || !Array.isArray(tweets) || tweets.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing screenName or tweets array" },
        { status: 400 }
      );
    }

    // Validate all tweets are under 280 chars
    const tooLong = tweets.findIndex((t: string) => t.length > 280);
    if (tooLong !== -1) {
      return NextResponse.json(
        { success: false, error: `Tweet ${tooLong + 1} is too long: ${tweets[tooLong].length}/280` },
        { status: 400 }
      );
    }

    if (!isConnected(screenName)) {
      return NextResponse.json(
        { success: false, error: "Account not connected. Login with X first." },
        { status: 401 }
      );
    }

    const result = await postThread(screenName, tweets);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to post thread" },
      { status: 500 }
    );
  }
}
