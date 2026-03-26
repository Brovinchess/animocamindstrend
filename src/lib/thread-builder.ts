/**
 * Converts full article content into a viral Twitter/X thread.
 *
 * Viral thread patterns applied:
 * - Tweet 1: Bold hook with contrarian/surprising angle
 * - Body: One idea per tweet, perspective-driven, mini-cliffhangers
 * - Transitions: "Here's where it gets interesting...", "But most people miss this:"
 * - Last tweet: Source link + CTA
 *
 * Optimal thread length: 5-12 tweets
 */

const MAX_CHARS = 260; // Leave room for numbering "\n\n5/10"

// Split article content into meaningful sentences
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 500);
}

// Remove filler/boilerplate
function filterSentences(sentences: string[]): string[] {
  const skip = [
    /^(sign up|subscribe|newsletter|cookie|privacy|terms|click here|read more|share this)/i,
    /^(advertisement|sponsored|promoted|related:|disclaimer)/i,
    /^\d+ min read$/i,
    /^(photo|image|credit|source|getty|shutterstock|unsplash)/i,
    /^(follow us|join us|connect with|written by|published|updated)/i,
    /^(this (article|post|story) (was|is|has))/i,
    /^(table of contents|key takeaways|summary|tl;?dr)/i,
  ];
  return sentences.filter((s) => !skip.some((p) => p.test(s)));
}

// Viral transition phrases to keep readers hooked
const TRANSITIONS = [
  "Here's where it gets interesting:",
  "But most people miss this part:",
  "And here's the kicker:",
  "This is the part that matters most:",
  "Now here's what really stands out:",
  "But wait — there's more to this story:",
  "The key insight most are overlooking:",
];

export interface ThreadResult {
  tweets: string[];
  totalChars: number;
  longestTweet: number;
}

export function buildThreadFromContent(
  title: string,
  content: string,
  sourceUrl: string,
  sourceName: string
): ThreadResult {
  const sentences = filterSentences(splitIntoSentences(content));

  if (sentences.length === 0) {
    return {
      tweets: [`${title}\n\n${sourceUrl}`],
      totalChars: title.length + sourceUrl.length + 2,
      longestTweet: title.length + sourceUrl.length + 2,
    };
  }

  // Group sentences into coherent tweet-sized chunks
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (current && (current + " " + sentence).length > MAX_CHARS) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? current + " " + sentence : sentence;
    }
    if (chunks.length >= 10) break; // Cap at 10 content chunks
  }
  if (current && chunks.length < 11) chunks.push(current);

  // Build the viral thread
  const totalCount = Math.min(chunks.length + 2, 14); // title + chunks + source
  const tweets: string[] = [];
  let transitionIdx = 0;

  // Tweet 1: HOOK — Bold, perspective-driven opening
  const hook = `${title}\n\nHere's what you need to know (and why it matters):`;
  tweets.push(hook.length > MAX_CHARS
    ? `${title.slice(0, MAX_CHARS - 10)}...\n\nA thread:`
    : hook
  );

  // Body tweets: one idea per tweet, with periodic transitions
  for (let i = 0; i < chunks.length; i++) {
    let tweetBody = chunks[i];

    // Add a transition hook every 3 tweets to maintain momentum
    if (i > 0 && i % 3 === 0 && transitionIdx < TRANSITIONS.length) {
      const transition = TRANSITIONS[transitionIdx++];
      if ((transition + "\n\n" + tweetBody).length <= MAX_CHARS) {
        tweetBody = transition + "\n\n" + tweetBody;
      }
    }

    // Trim if still over
    if (tweetBody.length > MAX_CHARS) {
      const cut = tweetBody.lastIndexOf(" ", MAX_CHARS - 3);
      tweetBody = tweetBody.slice(0, cut > 0 ? cut : MAX_CHARS - 3) + "...";
    }

    tweets.push(tweetBody);
  }

  // Last tweet: Source + CTA
  tweets.push(`Source: ${sourceName}\n\nFull article: ${sourceUrl}\n\nFollow for more breakdowns like this.`);

  // Add numbering to all tweets
  const numbered = tweets.map((t, i) => `${t}\n\n${i + 1}/${tweets.length}`);

  const longestTweet = Math.max(...numbered.map((t) => t.length));

  return {
    tweets: numbered,
    totalChars: numbered.reduce((sum, t) => sum + t.length, 0),
    longestTweet,
  };
}
