import { NextRequest, NextResponse } from "next/server";
import { submitPost, isConnected } from "@/lib/reddit-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, subreddit, title, text } = body;

    if (!username || !subreddit || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: username, subreddit, title" },
        { status: 400 }
      );
    }

    if (!isConnected(username)) {
      return NextResponse.json(
        { success: false, error: "Account not connected. Please login with Reddit first." },
        { status: 401 }
      );
    }

    const result = await submitPost(username, subreddit, title, text || "");

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to submit post" },
      { status: 500 }
    );
  }
}
