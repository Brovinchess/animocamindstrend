import { NextResponse } from "next/server";
import { fetchHNTopAI } from "@/lib/hackernews";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stories = await fetchHNTopAI(20);
    return NextResponse.json({
      success: true,
      count: stories.length,
      stories,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch Hacker News" },
      { status: 500 }
    );
  }
}
