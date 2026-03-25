import Parser from "rss-parser";
import { NEWS_SOURCES, type NewsSource } from "./news-sources";
import { extractTags } from "./topic-tags";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AI-News-Dashboard/1.0",
  },
});

export type SalienceScore = "HIGH" | "MEDIUM" | "LOW";

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: {
    name: string;
    slug: string;
    category: NewsSource["category"];
  };
  salienceScore: SalienceScore;
  tags: string[];
  readingTime: number;
  imageUrl?: string;
}

export interface FetchResult {
  items: NewsItem[];
  sourceHealth: Record<string, "ok" | "error">;
}

export function calculateSalience(title: string): SalienceScore {
  const highKeywords = [
    "launch", "release", "announce", "breakthrough", "gpt", "gemini",
    "claude", "llama", "model", "api", "open source", "safety",
    "regulation", "billion", "partnership", "acquisition", "new",
    "introducing", "preview", "available", "update",
  ];
  const lowTitle = title.toLowerCase();
  const matches = highKeywords.filter((kw) => lowTitle.includes(kw)).length;
  if (matches >= 2) return "HIGH";
  if (matches >= 1) return "MEDIUM";
  return "LOW";
}

function extractImage(content: string | undefined): string | undefined {
  if (!content) return undefined;
  const match = content.match(/<img[^>]+src="([^"]+)"/);
  return match?.[1];
}

function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .slice(0, 300);
}

async function fetchFeed(source: NewsSource): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.feedUrl);
    return (feed.items || []).slice(0, 10).map((item, idx) => {
      const title = item.title || "Untitled";
      const description = stripHtml(item.contentSnippet || item.content || item.summary);
      const wordCount = description.split(/\s+/).length;
      return {
        id: `${source.slug}-${idx}-${item.guid || item.link || idx}`,
        title,
        link: item.link || source.website,
        description,
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: {
          name: source.name,
          slug: source.slug,
          category: source.category,
        },
        salienceScore: calculateSalience(title),
        tags: extractTags(title, description),
        readingTime: Math.max(1, Math.ceil((wordCount * 3) / 200)),
        imageUrl:
          (item as Record<string, unknown>).enclosure
            ? ((item as Record<string, unknown>).enclosure as { url?: string })?.url
            : extractImage(item.content || item["content:encoded"]),
      };
    });
  } catch (err) {
    console.error(`Failed to fetch feed for ${source.name}:`, err);
    return [];
  }
}

export async function fetchAllNews(): Promise<FetchResult> {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map((source) => fetchFeed(source))
  );

  const allItems: NewsItem[] = [];
  const sourceHealth: Record<string, "ok" | "error"> = {};

  results.forEach((result, i) => {
    const slug = NEWS_SOURCES[i].slug;
    if (result.status === "fulfilled" && result.value.length > 0) {
      allItems.push(...result.value);
      sourceHealth[slug] = "ok";
    } else {
      sourceHealth[slug] = "error";
    }
  });

  allItems.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return { items: allItems, sourceHealth };
}

export async function fetchNewsBySource(slug: string): Promise<NewsItem[]> {
  const source = NEWS_SOURCES.find((s) => s.slug === slug);
  if (!source) return [];
  return fetchFeed(source);
}
