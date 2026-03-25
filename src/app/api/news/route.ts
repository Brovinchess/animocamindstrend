import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews, fetchNewsBySource } from "@/lib/fetch-news";
import { NEWS_SOURCES } from "@/lib/news-sources";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    let items;
    let sourceHealth: Record<string, "ok" | "error"> = {};

    if (source) {
      items = await fetchNewsBySource(source);
    } else {
      const result = await fetchAllNews();
      items = result.items;
      sourceHealth = result.sourceHealth;
    }

    if (category) {
      items = items.filter((item) => item.source.category === category);
    }

    items = items.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: items.length,
      sources: NEWS_SOURCES.map((s) => s.name),
      sourceHealth,
      timestamp: new Date().toISOString(),
      items,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
