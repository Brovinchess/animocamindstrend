import { NextRequest, NextResponse } from "next/server";
import { postTweet, isConnected } from "@/lib/twitter-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { screenName, text } = body;

    if (!screenName || !text) {
      return NextResponse.json(
        { success: false, error: "Missing screenName or text" },
        { status: 400 }
      );
    }

    if (text.length > 280) {
      return NextResponse.json(
        { success: false, error: `Tweet too long: ${text.length}/280 chars` },
        { status: 400 }
      );
    }

    if (!isConnected(screenName)) {
      return NextResponse.json(
        { success: false, error: "Account not connected. Login with X first." },
        { status: 401 }
      );
    }

    const result = await postTweet(screenName, text);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to post tweet" },
      { status: 500 }
    );
  }
}
