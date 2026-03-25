// Hacker News free public API — no auth needed

export interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number; // comment count
  hnUrl: string;
}

async function fetchStoryIds(type: "top" | "best" | "new" = "top"): Promise<number[]> {
  const res = await fetch(`https://hacker-news.firebaseio.com/v0/${type}stories.json`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return [];
  return res.json();
}

async function fetchStory(id: number): Promise<HNStory | null> {
  try {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.type !== "story" || data.dead || data.deleted) return null;
    return {
      id: data.id,
      title: data.title || "",
      url: data.url || `https://news.ycombinator.com/item?id=${data.id}`,
      score: data.score || 0,
      by: data.by || "unknown",
      time: data.time || 0,
      descendants: data.descendants || 0,
      hnUrl: `https://news.ycombinator.com/item?id=${data.id}`,
    };
  } catch {
    return null;
  }
}

const AI_FILTER_KEYWORDS = [
  "ai", "gpt", "llm", "openai", "anthropic", "claude", "gemini", "google ai",
  "machine learning", "deep learning", "neural", "transformer", "diffusion",
  "chatbot", "language model", "artificial intelligence", "ml", "nlp",
  "computer vision", "robotics", "autonomous", "nvidia", "gpu",
  "training", "inference", "fine-tune", "benchmark", "model",
  "agent", "rag", "embedding", "token", "prompt", "multimodal",
  "stable diffusion", "midjourney", "sora", "dall-e", "hugging face",
  "mistral", "llama", "open source ai", "deepmind", "perplexity",
];

function isAIRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_FILTER_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function fetchHNTopAI(limit: number = 30): Promise<HNStory[]> {
  const ids = await fetchStoryIds("top");
  if (!ids.length) return [];

  // Fetch top 100 stories, then filter to AI-related
  const top = ids.slice(0, 100);
  const stories = await Promise.all(top.map(fetchStory));

  const valid = stories.filter((s): s is HNStory => s !== null);
  const aiStories = valid.filter((s) => isAIRelated(s.title));

  // If not enough AI stories, include top tech stories
  if (aiStories.length < limit) {
    const techStories = valid.filter((s) => !aiStories.includes(s)).slice(0, limit - aiStories.length);
    return [...aiStories, ...techStories].slice(0, limit);
  }

  return aiStories.slice(0, limit);
}
