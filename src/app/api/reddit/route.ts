import { NextResponse } from "next/server";
import { fetchRedditTrends, SUBREDDITS } from "@/lib/reddit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { posts, hotTopics } = await fetchRedditTrends();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      subreddits: SUBREDDITS.map((s) => s.displayName),
      hotTopics,
      posts: posts.slice(0, 100),
      totalPosts: posts.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch Reddit trends" },
      { status: 500 }
    );
  }
}
