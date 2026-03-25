import type { NewsItem } from "./fetch-news";

export interface TweetDraft {
  id: string;
  style: string;
  text: string;
  charCount: number;
}

// Extract key points from article description
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

export function draftTweetsFromArticle(article: NewsItem): TweetDraft[] {
  const { title, description, link, source } = article;
  const points = extractKeyPoints(description);
  const mainPoint = points[0] || description.slice(0, 200);
  const secondPoint = points[1] || "";

  const drafts: TweetDraft[] = [];

  // 1. Summary tweet — condense the article into a tweet
  const summaryBody = points.slice(0, 3).join(". ");
  drafts.push(makeDraft("summary", "Article Summary",
    trimToFit(`${title}\n\n${summaryBody}\n\n(via ${source.name}) ${link}`, 280)
  ));

  // 2. Key takeaway — one strong insight
  drafts.push(makeDraft("takeaway", "Key Takeaway",
    trimToFit(`Key takeaway from ${source.name}:\n\n${mainPoint}.\n\n${secondPoint ? secondPoint + "." : ""}\n\nFull article: ${link}`, 280)
  ));

  // 3. Thread starter — for a multi-tweet breakdown
  const threadParts = points.slice(0, 4);
  const threadBody = [
    `🧵 ${title}`,
    "",
    "Here's what you need to know:",
    "",
    ...threadParts.map((p, i) => `${i + 1}. ${p}.`),
    "",
    `Source: ${source.name}`,
    `Full read: ${link}`,
  ].join("\n");
  drafts.push(makeDraft("thread", "Thread",
    trimToFit(threadBody, 280)
  ));

  // 4. Hot take — opinionated reaction
  drafts.push(makeDraft("hot-take", "Hot Take",
    trimToFit(`This is big: ${mainPoint}.\n\n${secondPoint ? `What makes this interesting: ${secondPoint}.` : "The implications here are bigger than people realize."}\n\nThoughts? ${link}`, 280)
  ));

  // 5. Breaking style — news anchor format
  drafts.push(makeDraft("breaking", "Breaking News",
    trimToFit(`BREAKING: ${mainPoint}.\n\n${secondPoint ? secondPoint + ".\n\n" : ""}${source.name} reports: ${link}`, 280)
  ));

  // 6. Question hook — engagement bait
  const questionBody = mainPoint.endsWith("?")
    ? mainPoint
    : `${mainPoint} — but what does this actually mean for the industry?`;
  drafts.push(makeDraft("question", "Question Hook",
    trimToFit(`${questionBody}\n\n${secondPoint ? secondPoint + ".\n\n" : ""}Read more: ${link}`, 280)
  ));

  // 7. Contrarian — challenge the narrative
  drafts.push(makeDraft("contrarian", "Contrarian Take",
    trimToFit(`Everyone's talking about "${title}" but here's what they're missing:\n\n${mainPoint}.\n\nThe real question is what happens next.\n\n${link}`, 280)
  ));

  return drafts;
}

function makeDraft(id: string, style: string, text: string): TweetDraft {
  return { id, style, text, charCount: text.length };
}

// Quick tweet for the card-level tweet button
export function quickTweetFromHeadline(title: string, url?: string): string {
  // Use the title as content, not just a link
  const templates = [
    `${title}\n\n${url || ""}`,
    `Interesting: ${title}\n\n${url || ""}`,
    `Worth reading — ${title}\n\n${url || ""}`,
    `This just in: ${title}\n\n${url || ""}`,
  ];
  const text = templates[Math.floor(Math.random() * templates.length)];
  return text.length > 280 ? text.slice(0, 277) + "..." : text;
}
