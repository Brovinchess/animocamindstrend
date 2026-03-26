export interface NewsSource {
  name: string;
  slug: string;
  feedUrl: string;
  website: string;
  category: "llm" | "search" | "cloud" | "research" | "hardware" | "infra" | "media" | "web3" | "finance";
}

export const NEWS_SOURCES: NewsSource[] = [
  // ── AI / LLM Providers ─────────────────────────────────────
  {
    name: "OpenAI",
    slug: "openai",
    feedUrl: "https://openai.com/blog/rss.xml",
    website: "https://openai.com/blog",
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

  // ── Cloud & Enterprise ─────────────────────────────────────
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

  // ── Hardware & Chips ───────────────────────────────────────
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

  // ── Research & Open Source ─────────────────────────────────
  {
    name: "Hugging Face",
    slug: "hugging-face",
    feedUrl: "https://huggingface.co/blog/feed.xml",
    website: "https://huggingface.co/blog",
    category: "research",
  },

  // ── AI Infrastructure ─────────────────────────────────────
  {
    name: "Together AI",
    slug: "together-ai",
    feedUrl: "https://www.together.ai/blog/rss.xml",
    website: "https://www.together.ai/blog",
    category: "infra",
  },

  // ── AI Media & News ────────────────────────────────────────
  {
    name: "AI News (VentureBeat)",
    slug: "venturebeat-ai",
    feedUrl: "https://venturebeat.com/category/ai/feed/",
    website: "https://venturebeat.com/category/ai/",
    category: "media",
  },
  {
    name: "Wired AI",
    slug: "wired-ai",
    feedUrl: "https://www.wired.com/feed/tag/ai/latest/rss",
    website: "https://www.wired.com/tag/ai/",
    category: "media",
  },
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
    name: "The Rundown AI",
    slug: "rundown-ai",
    feedUrl: "https://rss.beehiiv.com/feeds/2R3C6Bt5wj.xml",
    website: "https://www.therundown.ai/",
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
  {
    name: "IEEE Spectrum AI",
    slug: "ieee-spectrum",
    feedUrl: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",
    website: "https://spectrum.ieee.org/topic/artificial-intelligence/",
    category: "research",
  },

  // ── Web3 / Crypto ──────────────────────────────────────────
  {
    name: "CoinDesk",
    slug: "coindesk",
    feedUrl: "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml",
    website: "https://www.coindesk.com/",
    category: "web3",
  },
  {
    name: "Decrypt",
    slug: "decrypt",
    feedUrl: "https://decrypt.co/feed",
    website: "https://decrypt.co/",
    category: "web3",
  },
  {
    name: "CoinTelegraph",
    slug: "cointelegraph",
    feedUrl: "https://cointelegraph.com/rss",
    website: "https://cointelegraph.com/",
    category: "web3",
  },
  {
    name: "Decrypt Gaming",
    slug: "decrypt-gaming",
    feedUrl: "https://decrypt.co/feed/gaming",
    website: "https://decrypt.co/gaming",
    category: "web3",
  },
  {
    name: "Blockworks",
    slug: "blockworks",
    feedUrl: "https://blockworks.co/feed",
    website: "https://blockworks.co/",
    category: "web3",
  },
  {
    name: "Chainalysis",
    slug: "chainalysis",
    feedUrl: "https://www.chainalysis.com/blog/feed/",
    website: "https://www.chainalysis.com/blog",
    category: "web3",
  },
  {
    name: "Kraken Blog",
    slug: "kraken",
    feedUrl: "https://blog.kraken.com/feed",
    website: "https://blog.kraken.com/",
    category: "web3",
  },
  {
    name: "Messari",
    slug: "messari",
    feedUrl: "https://messari.io/rss",
    website: "https://messari.io/",
    category: "web3",
  },
  {
    name: "a16z Crypto",
    slug: "a16z-crypto",
    feedUrl: "https://a16zcrypto.substack.com/feed",
    website: "https://a16zcrypto.substack.com/",
    category: "web3",
  },
  {
    name: "The Defiant",
    slug: "the-defiant",
    feedUrl: "https://thedefiant.io/api/feed",
    website: "https://thedefiant.io/",
    category: "web3",
  },
  {
    name: "Ethereum Blog",
    slug: "ethereum-blog",
    feedUrl: "https://blog.ethereum.org/en/feed.xml",
    website: "https://blog.ethereum.org/",
    category: "web3",
  },
  {
    name: "Bitcoin Magazine",
    slug: "bitcoin-magazine",
    feedUrl: "https://bitcoinmagazine.com/feed",
    website: "https://bitcoinmagazine.com/",
    category: "web3",
  },

  // ── Finance / Markets ──────────────────────────────────────
  {
    name: "CNBC Finance",
    slug: "cnbc-finance",
    feedUrl: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664",
    website: "https://www.cnbc.com/finance/",
    category: "finance",
  },
  {
    name: "CNBC Tech",
    slug: "cnbc-tech",
    feedUrl: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19854910",
    website: "https://www.cnbc.com/technology/",
    category: "finance",
  },
  {
    name: "MarketWatch",
    slug: "marketwatch",
    feedUrl: "https://feeds.content.dowjones.io/public/rss/mw_topstories",
    website: "https://www.marketwatch.com/",
    category: "finance",
  },
  {
    name: "Seeking Alpha",
    slug: "seeking-alpha",
    feedUrl: "https://seekingalpha.com/market_currents.xml",
    website: "https://seekingalpha.com/",
    category: "finance",
  },
  {
    name: "WSJ Business",
    slug: "wsj-business",
    feedUrl: "https://feeds.content.dowjones.io/public/rss/WSJcomUSBusiness",
    website: "https://www.wsj.com/business",
    category: "finance",
  },
  {
    name: "WSJ Markets",
    slug: "wsj-markets",
    feedUrl: "https://feeds.content.dowjones.io/public/rss/RSSMarketsMain",
    website: "https://www.wsj.com/market-data",
    category: "finance",
  },
  {
    name: "Fortune",
    slug: "fortune",
    feedUrl: "https://fortune.com/feed/fortune-feeds/?id=3230629",
    website: "https://fortune.com/",
    category: "finance",
  },
  {
    name: "Motley Fool",
    slug: "motley-fool",
    feedUrl: "https://www.fool.com/feeds/index.aspx?id=foolwatch&format=rss2",
    website: "https://www.fool.com/",
    category: "finance",
  },
  {
    name: "Yahoo Finance",
    slug: "yahoo-finance",
    feedUrl: "https://finance.yahoo.com/news/rssindex",
    website: "https://finance.yahoo.com/",
    category: "finance",
  },
  {
    name: "Kiplinger",
    slug: "kiplinger",
    feedUrl: "https://www.kiplinger.com/feed/all",
    website: "https://www.kiplinger.com/",
    category: "finance",
  },
];

export type CategoryType = NewsSource["category"];

// Categories that belong to the AI News tab
export const AI_CATEGORIES: CategoryType[] = ["llm", "search", "cloud", "research", "hardware", "infra", "media"];

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  llm: "LLM Providers",
  search: "Search & AI",
  cloud: "Cloud & Enterprise",
  research: "Research & Open Source",
  hardware: "Hardware & Chips",
  infra: "AI Infrastructure",
  media: "AI Media",
  web3: "Web3 / Crypto",
  finance: "Finance & Markets",
};
