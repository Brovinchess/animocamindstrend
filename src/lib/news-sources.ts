export interface NewsSource {
  name: string;
  slug: string;
  feedUrl: string;
  website: string;
  category: "llm" | "search" | "cloud" | "research" | "hardware" | "infra" | "media";
}

export const NEWS_SOURCES: NewsSource[] = [
  // LLM Providers
  {
    name: "OpenAI",
    slug: "openai",
    feedUrl: "https://openai.com/blog/rss.xml",
    website: "https://openai.com/blog",
    category: "llm",
  },
  {
    name: "Anthropic",
    slug: "anthropic",
    feedUrl: "https://www.anthropic.com/news/rss",
    website: "https://www.anthropic.com/news",
    category: "llm",
  },
  {
    name: "Google AI",
    slug: "google-ai",
    feedUrl: "https://blog.google/technology/ai/rss/",
    website: "https://blog.google/technology/ai/",
    category: "search",
  },
  {
    name: "DeepMind",
    slug: "deepmind",
    feedUrl: "https://deepmind.google/blog/rss.xml",
    website: "https://deepmind.google/blog/",
    category: "research",
  },
  {
    name: "Meta AI",
    slug: "meta-ai",
    feedUrl: "https://engineering.fb.com/category/ml-applications/feed/",
    website: "https://ai.meta.com/blog/",
    category: "llm",
  },
  {
    name: "Mistral AI",
    slug: "mistral-ai",
    feedUrl: "https://mistral.ai/news/rss.xml",
    website: "https://mistral.ai/news/",
    category: "llm",
  },
  {
    name: "Cohere",
    slug: "cohere",
    feedUrl: "https://cohere.com/blog/rss.xml",
    website: "https://cohere.com/blog",
    category: "llm",
  },
  {
    name: "Perplexity",
    slug: "perplexity",
    feedUrl: "https://www.perplexity.ai/hub/blog/rss.xml",
    website: "https://www.perplexity.ai/hub/blog",
    category: "search",
  },

  // Cloud & Enterprise
  {
    name: "Microsoft AI",
    slug: "microsoft-ai",
    feedUrl: "https://blogs.microsoft.com/ai/feed/",
    website: "https://blogs.microsoft.com/ai/",
    category: "cloud",
  },
  {
    name: "Amazon AWS AI",
    slug: "aws-ai",
    feedUrl: "https://aws.amazon.com/blogs/machine-learning/feed/",
    website: "https://aws.amazon.com/blogs/machine-learning/",
    category: "cloud",
  },

  // Hardware & Chips
  {
    name: "NVIDIA AI",
    slug: "nvidia-ai",
    feedUrl: "https://blogs.nvidia.com/feed/",
    website: "https://blogs.nvidia.com/",
    category: "hardware",
  },
  {
    name: "Apple ML",
    slug: "apple-ml",
    feedUrl: "https://machinelearning.apple.com/rss.xml",
    website: "https://machinelearning.apple.com/",
    category: "hardware",
  },

  // Research & Open Source
  {
    name: "Hugging Face",
    slug: "hugging-face",
    feedUrl: "https://huggingface.co/blog/feed.xml",
    website: "https://huggingface.co/blog",
    category: "research",
  },
  {
    name: "Stability AI",
    slug: "stability-ai",
    feedUrl: "https://stability.ai/news/rss.xml",
    website: "https://stability.ai/news",
    category: "research",
  },

  // AI Infrastructure
  {
    name: "Replicate",
    slug: "replicate",
    feedUrl: "https://replicate.com/blog/rss.xml",
    website: "https://replicate.com/blog",
    category: "infra",
  },
  {
    name: "Together AI",
    slug: "together-ai",
    feedUrl: "https://www.together.ai/blog/rss.xml",
    website: "https://www.together.ai/blog",
    category: "infra",
  },

  // xAI / Grok
  {
    name: "xAI",
    slug: "xai",
    feedUrl: "https://x.ai/blog/rss.xml",
    website: "https://x.ai/blog",
    category: "llm",
  },

  // AI Media & News
  {
    name: "The Verge AI",
    slug: "verge-ai",
    feedUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    website: "https://www.theverge.com/ai-artificial-intelligence",
    category: "media",
  },
  {
    name: "TechCrunch AI",
    slug: "techcrunch-ai",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
    website: "https://techcrunch.com/category/artificial-intelligence/",
    category: "media",
  },
  {
    name: "Ars Technica AI",
    slug: "arstechnica-ai",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    website: "https://arstechnica.com/ai/",
    category: "media",
  },
  {
    name: "MIT Tech Review",
    slug: "mit-tech-review",
    feedUrl: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    website: "https://www.technologyreview.com/topic/artificial-intelligence/",
    category: "media",
  },
];

export type CategoryType = NewsSource["category"];

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  llm: "LLM Providers",
  search: "Search & AI",
  cloud: "Cloud & Enterprise",
  research: "Research & Open Source",
  hardware: "Hardware & Chips",
  infra: "AI Infrastructure",
  media: "AI Media",
};
