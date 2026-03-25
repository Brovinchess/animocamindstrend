import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews, calculateSalience } from "@/lib/fetch-news";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const query = searchParams.get("query")?.toLowerCase();
  return generatePulse(limit, query);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const limit = body.limit || 20;
    const query = body.query?.toLowerCase();
    return generatePulse(limit, query);
  } catch {
    return NextResponse.json(
      { pulse_type: "error", message: "Invalid request body" },
      { status: 400 }
    );
  }
}

async function generatePulse(limit: number, query?: string) {
  try {
    const { items: allItems } = await fetchAllNews();
    let items = allItems;

    if (query) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.source.name.toLowerCase().includes(query)
      );
    }

    items = items.slice(0, limit);

    const pulse = {
      pulse_type: "intelligence_pulse",
      pulse_id: `pulse-${Date.now()}`,
      timestamp: new Date().toISOString(),
      classification: "AI_TECHNOLOGY_NEWS",
      salience: items.length > 0 ? "ACTIVE" : "LOW",
      summary: {
        total_items: items.length,
        sources_reporting: [...new Set(items.map((i) => i.source.name))],
        categories_active: [...new Set(items.map((i) => i.source.category))],
        latest_item_date: items[0]?.pubDate || null,
      },
      items: items.map((item) => ({
        headline: item.title,
        url: item.link,
        brief: item.description,
        published: item.pubDate,
        origin: item.source.name,
        origin_category: item.source.category,
        salience_score: calculateSalience(item.title),
      })),
      metadata: {
        generated_by: "ai-news-dashboard",
        version: "2.0.0",
        query: query || null,
      },
    };

    return NextResponse.json(pulse);
  } catch {
    return NextResponse.json(
      { pulse_type: "error", message: "Failed to generate intelligence pulse" },
      { status: 500 }
    );
  }
}
