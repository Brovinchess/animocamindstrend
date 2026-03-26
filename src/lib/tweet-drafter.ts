import type { NewsItem } from "./fetch-news";

export interface TweetDraft {
  id: string;
  style: string;
  text: string;
  charCount: number;
}

// Extract meaningful sentences from article description
function extractKeyPoints(description: string): string[] {
  const sentences = description
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
  return sentences;
}

// Shorten text to fit within a char limit while keeping it readable
function trimToFit(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 3);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace) + "...";
}

// Detect what kind of news this is for smarter drafts
function detectNewsType(article: NewsItem): string {
  const text = `${article.title} ${article.description}`.toLowerCase();
  if (/launch|release|announc|ship|roll.?out|debut|unveil/i.test(text)) return "launch";
  if (/rais|fund|invest|valuat|series [a-d]|ipo|acqui/i.test(text)) return "funding";
  if (/vulnerab|breach|hack|exploit|leak|security/i.test(text)) return "security";
  if (/regulat|ban|law|legislat|govern|policy|eu|congress/i.test(text)) return "regulation";
  if (/research|paper|study|found that|experiment|benchmark/i.test(text)) return "research";
  if (/open.?source|github|model.?weight|apache|mit license/i.test(text)) return "opensource";
  if (/partner|collab|integrat|deal|agreement/i.test(text)) return "partnership";
  if (/bitcoin|ethereum|crypto|blockchain|web3|nft|defi|token|airdrop|solana|polygon/i.test(text)) return "web3";
  if (/stock|market|fed|inflation|earnings|ipo|nasdaq|recession|treasury|gdp/i.test(text)) return "finance";
  return "general";
}

// Extract the company/product name being discussed
function extractSubject(title: string): string {
  const companyPatterns = [
    /\b(OpenAI|Google|Microsoft|Meta|Anthropic|Apple|Amazon|NVIDIA|Mistral|Cohere|Stability AI|Hugging Face|xAI|Perplexity)\b/i,
    /\b(GPT-\d+|Claude|Gemini|Llama|Copilot|ChatGPT|Midjourney|DALL-E|Sora|Grok)\b/i,
    /\b(Bitcoin|Ethereum|Solana|Polygon|Coinbase|Binance|Animoca|Immutable|Uniswap)\b/i,
  ];
  for (const pattern of companyPatterns) {
    const match = title.match(pattern);
    if (match) return match[1];
  }
  return "";
}

export function draftTweetsFromArticle(article: NewsItem): TweetDraft[] {
  const { title, description, link, source, tags } = article;
  const points = extractKeyPoints(description);
  const mainPoint = points[0] || description.slice(0, 200);
  const secondPoint = points[1] || "";
  const thirdPoint = points[2] || "";
  const newsType = detectNewsType(article);
  const subject = extractSubject(title);
  const tagLabels = tags.slice(0, 3).join(" #").replace(/\s+/g, "");
  const hashtags = tagLabels ? `\n\n#AI #${tagLabels}` : "\n\n#AI #Tech";

  const drafts: TweetDraft[] = [];

  // 1. Insightful Analysis — provide genuine value
  const analysisBody = [
    mainPoint,
    secondPoint ? `\n\n${secondPoint}.` : "",
    thirdPoint ? ` ${thirdPoint}.` : "",
  ].join("");
  drafts.push(makeDraft("analysis", "Analysis",
    trimToFit(`${subject ? `${subject}: ` : ""}${analysisBody}${hashtags}\n\n${link}`, 280)
  ));

  // 2. Why It Matters — focus on implications
  const whyItMatters = newsType === "launch"
    ? `${subject || "This"} just changed the game. ${mainPoint}.\n\nHere's why this matters for the AI ecosystem${secondPoint ? `:\n\n${secondPoint}` : "."}`
    : newsType === "funding"
    ? `The money is following the signal. ${mainPoint}.\n\n${secondPoint ? secondPoint + "." : "This tells us a lot about where AI is headed."}`
    : newsType === "regulation"
    ? `Policy is catching up to the tech. ${mainPoint}.\n\n${secondPoint ? secondPoint + "." : "The regulatory landscape is shifting fast."}`
    : newsType === "research"
    ? `New research worth paying attention to: ${mainPoint}.\n\n${secondPoint ? secondPoint + "." : "The implications are significant."}`
    : newsType === "security"
    ? `Security matters more than speed. ${mainPoint}.\n\n${secondPoint ? secondPoint + "." : "This is a wake-up call."}`
    : newsType === "web3"
    ? `Web3 signal worth watching: ${mainPoint}.\n\n${secondPoint ? secondPoint + "." : "The on-chain narrative is shifting."}`
    : newsType === "finance"
    ? `Markets are moving. ${mainPoint}.\n\n${secondPoint ? secondPoint + "." : "Here's what this means for the macro picture."}`
    : `${mainPoint}.\n\n${secondPoint ? `Why this matters: ${secondPoint}.` : "The implications here run deeper than the headline suggests."}`;
  drafts.push(makeDraft("why-it-matters", "Why It Matters",
    trimToFit(`${whyItMatters}\n\n${link}`, 280)
  ));

  // 3. Thread — designed for thread mode, NOT trimmed to 280
  const threadParts = points.slice(0, 5);
  const threadBody = [
    `${subject ? subject + ": " : ""}${title}`,
    "",
    "Here's what you need to know:",
    "",
    ...threadParts.map((p, i) => `${i + 1}. ${p}.`),
    "",
    secondPoint ? `Why this matters: ${secondPoint}.` : "",
    thirdPoint ? `${thirdPoint}.` : "",
    "",
    `Source: ${source.name}`,
    `Full article: ${link}`,
  ].filter(Boolean).join("\n");
  drafts.push(makeDraft("thread", "Thread",
    threadBody // No trim — thread mode auto-splits into multiple tweets
  ));

  // 4. Industry Perspective — thought leadership
  const perspective = newsType === "launch"
    ? `${subject || "Another major player"} is making moves. ${mainPoint}.\n\nThe pace of AI development isn't slowing down — it's accelerating.`
    : newsType === "opensource"
    ? `Open source continues to close the gap. ${mainPoint}.\n\nThe democratization of AI is real and happening fast.`
    : newsType === "partnership"
    ? `Strategic partnerships are reshaping AI. ${mainPoint}.\n\nWatch who's teaming up — it reveals where the industry is going.`
    : `${mainPoint}.\n\n${secondPoint ? secondPoint + ". " : ""}The AI landscape is evolving faster than most realize.`;
  drafts.push(makeDraft("perspective", "Industry Take",
    trimToFit(`${perspective}\n\n${link}`, 280)
  ));

  // 5. Question Hook — drive engagement
  const questionBody = newsType === "launch"
    ? `${subject || "Big"} news: ${mainPoint}.\n\nBut the real question — does this actually move the needle for end users? What do you think?`
    : newsType === "regulation"
    ? `${mainPoint}.\n\nShould AI regulation move faster or are we at risk of stifling innovation? Genuinely curious where people stand.`
    : `${mainPoint}.\n\nWhat's your take on this? ${secondPoint ? secondPoint + "." : "I think the implications are bigger than they appear."}`;
  drafts.push(makeDraft("question", "Engagement Hook",
    trimToFit(`${questionBody}\n\n${link}`, 280)
  ));

  // 6. Quick Share — concise for max reach
  const quickBodies = [
    `${title}\n\n${mainPoint}.\n\n${link}`,
    `Worth reading: ${mainPoint}.\n\nvia ${source.name}\n\n${link}`,
    `${mainPoint}.\n\n${link}`,
  ];
  const quickBody = quickBodies.find((b) => b.length <= 280) || quickBodies[2];
  drafts.push(makeDraft("quick", "Quick Share",
    trimToFit(quickBody, 280)
  ));

  // 7. Contrarian — challenge assumptions
  const contrarian = newsType === "launch"
    ? `Everyone's hyped about ${subject || "this"}. But let's be honest — ${mainPoint}.\n\nThe real test isn't the launch, it's what happens in 6 months.`
    : newsType === "funding"
    ? `More money doesn't mean better AI. ${mainPoint}.\n\nThe question isn't who's raising — it's who's actually building.`
    : `"${title}"\n\nBefore you take this at face value: ${mainPoint}.\n\nThere's more nuance here than most coverage suggests.`;
  drafts.push(makeDraft("contrarian", "Contrarian",
    trimToFit(`${contrarian}\n\n${link}`, 280)
  ));

  return drafts;
}

function makeDraft(id: string, style: string, text: string): TweetDraft {
  return { id, style, text, charCount: text.length };
}

// Quick tweet for the card-level tweet button
export function quickTweetFromHeadline(title: string, url?: string): string {
  const templates = [
    `${title}\n\n${url || ""}`,
    `Interesting development: ${title}\n\n${url || ""}`,
    `Worth reading — ${title}\n\n${url || ""}`,
    `This is significant: ${title}\n\n${url || ""}`,
  ];
  const text = templates[Math.floor(Math.random() * templates.length)];
  return text.length > 280 ? text.slice(0, 277) + "..." : text;
}
