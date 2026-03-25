// Uses Reddit's public JSON API (no auth needed, more reliable than RSS)

export interface RedditPost {
  id: string;
  title: string;
  link: string;
  subreddit: string;
  author: string;
  score: number;
  comments: number;
  pubDate: string;
  thumbnail?: string;
  selftext: string;
  flair?: string;
  heatScore: number; // calculated engagement velocity
}

export type SubredditCategory = "ai" | "general";

export interface SubredditConfig {
  name: string;
  displayName: string;
  description: string;
  category: SubredditCategory;
}

export const SUBREDDITS: SubredditConfig[] = [
  // AI-specific
  { name: "artificial", displayName: "r/artificial", description: "AI general discussion", category: "ai" },
  { name: "MachineLearning", displayName: "r/MachineLearning", description: "ML research & papers", category: "ai" },
  { name: "ChatGPT", displayName: "r/ChatGPT", description: "ChatGPT users & news", category: "ai" },
  { name: "LocalLLaMA", displayName: "r/LocalLLaMA", description: "Open-source LLM community", category: "ai" },
  { name: "singularity", displayName: "r/singularity", description: "AGI & future of AI", category: "ai" },
  { name: "OpenAI", displayName: "r/OpenAI", description: "OpenAI discussion", category: "ai" },
  { name: "StableDiffusion", displayName: "r/StableDiffusion", description: "AI image generation", category: "ai" },
  { name: "ArtificialInteligence", displayName: "r/ArtificialIntelligence", description: "AI news & debate", category: "ai" },
  { name: "ClaudeAI", displayName: "r/ClaudeAI", description: "Anthropic Claude users", category: "ai" },
  // General / trending
  { name: "technology", displayName: "r/technology", description: "Tech news", category: "general" },
  { name: "worldnews", displayName: "r/worldnews", description: "Global news", category: "general" },
  { name: "science", displayName: "r/science", description: "Science news", category: "general" },
  { name: "Futurology", displayName: "r/Futurology", description: "Future tech & society", category: "general" },
  { name: "gadgets", displayName: "r/gadgets", description: "Tech gadgets", category: "general" },
  { name: "business", displayName: "r/business", description: "Business news", category: "general" },
  { name: "stocks", displayName: "r/stocks", description: "Stock market", category: "general" },
  { name: "programming", displayName: "r/programming", description: "Programming", category: "general" },
  { name: "gaming", displayName: "r/gaming", description: "Gaming", category: "general" },
  { name: "popular", displayName: "r/popular", description: "Reddit front page", category: "general" },
];

function calculateHeat(score: number, comments: number, createdUtc: number): number {
  const ageHours = Math.max(1, (Date.now() / 1000 - createdUtc) / 3600);
  const engagement = score + comments * 3;
  return Math.round((engagement / Math.pow(ageHours, 1.2)) * 100) / 100;
}

interface RedditJsonPost {
  data: {
    id: string;
    title: string;
    permalink: string;
    subreddit: string;
    author: string;
    score: number;
    num_comments: number;
    created_utc: number;
    selftext: string;
    link_flair_text?: string;
    thumbnail?: string;
    stickied: boolean;
  };
}

async function fetchSubreddit(sub: SubredditConfig): Promise<RedditPost[]> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${sub.name}/hot.json?limit=15`,
      {
        headers: {
          "User-Agent": "animocaminds:v1.0 (by /u/animocaminds)",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      console.error(`Reddit r/${sub.name}: HTTP ${res.status}`);
      return [];
    }

    const json = await res.json();
    const children: RedditJsonPost[] = json?.data?.children || [];

    return children
      .filter((c) => !c.data.stickied)
      .slice(0, 15)
      .map((c) => {
        const d = c.data;
        const pubDate = new Date(d.created_utc * 1000).toISOString();
        return {
          id: `${sub.name}-${d.id}`,
          title: d.title,
          link: `https://reddit.com${d.permalink}`,
          subreddit: d.subreddit,
          author: d.author,
          score: d.score,
          comments: d.num_comments,
          pubDate,
          selftext: (d.selftext || "").slice(0, 400),
          flair: d.link_flair_text || undefined,
          thumbnail: d.thumbnail && d.thumbnail.startsWith("http") ? d.thumbnail : undefined,
          heatScore: calculateHeat(d.score, d.num_comments, d.created_utc),
        };
      });
  } catch (err) {
    console.error(`Failed to fetch r/${sub.name}:`, err);
    return [];
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchRedditTrends(): Promise<{
  posts: RedditPost[];
  hotTopics: HotTopic[];
}> {
  // Batch fetches in groups of 4 with 1s delay to avoid Reddit rate limits
  const allPosts: RedditPost[] = [];
  const batchSize = 4;

  for (let i = 0; i < SUBREDDITS.length; i += batchSize) {
    const batch = SUBREDDITS.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((sub) => fetchSubreddit(sub))
    );
    for (const result of results) {
      if (result.status === "fulfilled") {
        allPosts.push(...result.value);
      }
    }
    if (i + batchSize < SUBREDDITS.length) {
      await delay(1000);
    }
  }

  // Sort by heat score (trending velocity)
  allPosts.sort((a, b) => b.heatScore - a.heatScore);

  // Extract hot topics by analyzing title keywords
  const hotTopics = extractHotTopics(allPosts);

  return { posts: allPosts, hotTopics };
}

export interface HotTopic {
  keyword: string;
  count: number;
  avgScore: number;
  avgComments: number;
  subreddits: string[];
  signal: "fire" | "rising" | "warm";
}

function extractHotTopics(posts: RedditPost[]): HotTopic[] {
  const AI_KEYWORDS = [
    "gpt", "openai", "claude", "anthropic", "gemini", "google", "llama", "meta",
    "mistral", "grok", "xai", "nvidia", "apple", "microsoft", "copilot",
    "sora", "midjourney", "stable diffusion", "dall-e", "perplexity",
    "open source", "fine-tune", "rag", "agent", "reasoning", "benchmark",
    "safety", "regulation", "agi", "robotics", "coding", "api",
    "local", "self-host", "ollama", "hugging face", "model", "training",
    "inference", "gpu", "token", "context", "multimodal", "voice",
  ];

  const topicMap: Record<string, { count: number; scores: number[]; comments: number[]; subs: Set<string> }> = {};

  for (const post of posts) {
    const text = post.title.toLowerCase();
    for (const kw of AI_KEYWORDS) {
      if (text.includes(kw)) {
        if (!topicMap[kw]) {
          topicMap[kw] = { count: 0, scores: [], comments: [], subs: new Set() };
        }
        topicMap[kw].count++;
        topicMap[kw].scores.push(post.score);
        topicMap[kw].comments.push(post.comments);
        topicMap[kw].subs.add(post.subreddit);
      }
    }
  }

  const topics: HotTopic[] = Object.entries(topicMap)
    .filter(([, v]) => v.count >= 2) // at least 2 mentions
    .map(([keyword, v]) => ({
      keyword,
      count: v.count,
      avgScore: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
      avgComments: Math.round(v.comments.reduce((a, b) => a + b, 0) / v.comments.length),
      subreddits: [...v.subs],
      signal: v.count >= 5 ? "fire" as const : v.count >= 3 ? "rising" as const : "warm" as const,
    }))
    .sort((a, b) => b.count - a.count || b.avgScore - a.avgScore);

  return topics.slice(0, 15);
}
