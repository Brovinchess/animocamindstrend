// Generate tweet drafts from AI news articles

import type { NewsItem } from "./fetch-news";

export interface TweetDraft {
  id: string;
  style: string;
  text: string;
  charCount: number;
}

const STYLES = [
  "breaking",
  "insight",
  "question",
  "thread-hook",
  "hot-take",
] as const;

export function draftTweetsFromArticle(article: NewsItem): TweetDraft[] {
  const title = article.title;
  const source = article.source.name;
  const link = article.link;
  const short = title.length > 80 ? title.slice(0, 80) + "..." : title;

  const drafts: TweetDraft[] = [];

  // 1. Breaking news style
  drafts.push({
    id: "breaking",
    style: "Breaking News",
    text: `${title}\n\nvia ${source}\n${link}`,
    charCount: 0,
  });

  // 2. Insight/analysis
  drafts.push({
    id: "insight",
    style: "Insight + Link",
    text: `This is significant: "${short}"\n\nHere's why it matters for the AI space:\n\n→ [Your take]\n→ [Implication]\n\n${link}`,
    charCount: 0,
  });

  // 3. Question/engagement
  drafts.push({
    id: "question",
    style: "Question Hook",
    text: `"${short}"\n\nWhat do you think — is this actually a big deal or are we overreacting?\n\n${link}`,
    charCount: 0,
  });

  // 4. Thread hook
  drafts.push({
    id: "thread-hook",
    style: "Thread Starter",
    text: `THREAD: "${short}" 🧵\n\nLet me break down why this matters and what most people are missing:\n\n1/`,
    charCount: 0,
  });

  // 5. Hot take
  drafts.push({
    id: "hot-take",
    style: "Hot Take",
    text: `Hot take: "${short}" is going to age really well.\n\nMost people are sleeping on this but the implications are massive for [industry/tech/users].\n\n${link}`,
    charCount: 0,
  });

  // 6. Short + punchy
  drafts.push({
    id: "short",
    style: "Short & Punchy",
    text: `${short}\n\nThe AI space moves fast. ${link}`,
    charCount: 0,
  });

  // 7. Personal reaction
  drafts.push({
    id: "personal",
    style: "Personal Reaction",
    text: `Just read this and had to share — "${short}"\n\nMy honest reaction: [your reaction]\n\nThis changes [what it changes].\n\n${link}`,
    charCount: 0,
  });

  // Calculate char counts
  for (const d of drafts) {
    d.charCount = d.text.length;
  }

  return drafts;
}

// Generate a quick tweet from just a headline for the trending section
export function quickTweetFromHeadline(title: string, url?: string): string {
  const templates = [
    `${title}${url ? `\n\n${url}` : ""}`,
    `This is huge: ${title}${url ? `\n\n${url}` : ""}`,
    `Interesting development in AI:\n\n"${title}"${url ? `\n\n${url}` : ""}`,
    `The AI news cycle never slows down:\n\n${title}${url ? `\n\n${url}` : ""}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
