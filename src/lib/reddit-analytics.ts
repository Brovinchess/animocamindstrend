import type { RedditPost, HotTopic } from "./reddit";

export interface PostAnalysis {
  post: RedditPost;
  titleLength: number;
  hasQuestion: boolean;
  hasNumbers: boolean;
  sentiment: "positive" | "negative" | "neutral" | "controversial";
  titlePattern: string;
  engagementRatio: number; // comments per upvote — higher = more discussion
}

export interface TopicBreakdown {
  topic: HotTopic;
  topPosts: PostAnalysis[];
  patterns: PostPattern[];
  bestSubreddit: { name: string; avgScore: number };
  bestTimeWindow: string;
  suggestedAngles: string[];
}

export interface PostPattern {
  pattern: string;
  examples: number;
  avgScore: number;
}

export interface TimingInsight {
  subreddit: string;
  peakHours: number[]; // hours in UTC
  bestDay: string;
  avgScoreAtPeak: number;
}

function analyzeSentiment(title: string): PostAnalysis["sentiment"] {
  const lower = title.toLowerCase();
  const negWords = ["shut down", "fail", "disappointed", "ban", "lawsuit", "scam", "warning", "concern", "problem", "worse", "layoff", "fired", "dead", "killed", "fraud"];
  const posWords = ["breakthrough", "amazing", "incredible", "free", "launch", "new", "better", "faster", "open source", "released", "introducing", "improved"];
  const controWords = ["vs", "overrated", "unpopular opinion", "hot take", "debate", "controversial", "change my mind", "am i the only"];

  const negCount = negWords.filter((w) => lower.includes(w)).length;
  const posCount = posWords.filter((w) => lower.includes(w)).length;
  const controCount = controWords.filter((w) => lower.includes(w)).length;

  if (controCount > 0) return "controversial";
  if (negCount > posCount) return "negative";
  if (posCount > negCount) return "positive";
  return "neutral";
}

function detectPattern(title: string): string {
  const lower = title.toLowerCase();
  if (lower.match(/^\[.*\]/)) return "Tag/Label format";
  if (lower.endsWith("?")) return "Question";
  if (lower.match(/^(how|what|why|when|where|who|which|is|are|do|does|can|should)/i)) return "Question";
  if (lower.match(/^(i |my |we )/i)) return "Personal story";
  if (lower.match(/just |finally /i)) return "Milestone/achievement";
  if (lower.match(/\d+/) && lower.match(/(tips|ways|things|reasons|steps)/i)) return "Listicle";
  if (lower.match(/vs\.?|versus|compared/i)) return "Comparison";
  if (lower.match(/psa|til|reminder/i)) return "PSA/TIL";
  if (lower.match(/guide|tutorial|how to/i)) return "Guide/Tutorial";
  if (lower.match(/announce|introducing|launch|released/i)) return "Announcement";
  return "Statement/News";
}

export function analyzePost(post: RedditPost): PostAnalysis {
  return {
    post,
    titleLength: post.title.length,
    hasQuestion: post.title.includes("?"),
    hasNumbers: /\d/.test(post.title),
    sentiment: analyzeSentiment(post.title),
    titlePattern: detectPattern(post.title),
    engagementRatio: post.score > 0 ? Math.round((post.comments / post.score) * 100) / 100 : 0,
  };
}

export function analyzeTopicPosts(
  topic: HotTopic,
  allPosts: RedditPost[]
): TopicBreakdown {
  // Find posts matching this topic
  const matching = allPosts.filter((p) =>
    p.title.toLowerCase().includes(topic.keyword)
  );

  const topPosts = matching
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(analyzePost);

  // Find common patterns
  const patternCounts: Record<string, { count: number; scores: number[] }> = {};
  for (const p of topPosts) {
    if (!patternCounts[p.titlePattern]) {
      patternCounts[p.titlePattern] = { count: 0, scores: [] };
    }
    patternCounts[p.titlePattern].count++;
    patternCounts[p.titlePattern].scores.push(p.post.score);
  }

  const patterns: PostPattern[] = Object.entries(patternCounts)
    .map(([pattern, v]) => ({
      pattern,
      examples: v.count,
      avgScore: Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length),
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  // Best subreddit for this topic
  const subScores: Record<string, number[]> = {};
  for (const p of matching) {
    if (!subScores[p.subreddit]) subScores[p.subreddit] = [];
    subScores[p.subreddit].push(p.score);
  }

  const bestSub = Object.entries(subScores)
    .map(([name, scores]) => ({
      name,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .sort((a, b) => b.avgScore - a.avgScore)[0] || { name: "unknown", avgScore: 0 };

  // Analyze posting times
  const hours = matching.map((p) => new Date(p.pubDate).getUTCHours());
  const hourCounts: Record<number, number> = {};
  for (const h of hours) {
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  }
  const peakHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
  const bestTimeWindow = peakHour
    ? `${formatHour(parseInt(peakHour[0]))} - ${formatHour((parseInt(peakHour[0]) + 2) % 24)} UTC`
    : "Anytime";

  // Generate angle suggestions based on pattern analysis
  const suggestedAngles = generateAngles(topic, topPosts, patterns);

  return {
    topic,
    topPosts,
    patterns,
    bestSubreddit: bestSub,
    bestTimeWindow,
    suggestedAngles,
  };
}

function formatHour(h: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}${ampm}`;
}

function generateAngles(
  topic: HotTopic,
  topPosts: PostAnalysis[],
  patterns: PostPattern[]
): string[] {
  const angles: string[] = [];
  const kw = topic.keyword;

  // Based on what's working
  const topPattern = patterns[0];
  if (topPattern) {
    switch (topPattern.pattern) {
      case "Question":
        angles.push(`Ask a thought-provoking question about ${kw} — questions avg ${topPattern.avgScore} pts`);
        break;
      case "Personal story":
        angles.push(`Share a personal experience with ${kw} — "I just tried..." format works well`);
        break;
      case "Comparison":
        angles.push(`Compare ${kw} with a competitor — "X vs Y" posts get high engagement`);
        break;
      case "Guide/Tutorial":
        angles.push(`Write a quick guide or tips about ${kw} — tutorials get saved & shared`);
        break;
      default:
        angles.push(`${topPattern.pattern} format is trending for ${kw} (avg ${topPattern.avgScore} pts)`);
    }
  }

  // Sentiment-based angles
  const sentiments = topPosts.map((p) => p.sentiment);
  const negCount = sentiments.filter((s) => s === "negative").length;
  const posCount = sentiments.filter((s) => s === "positive").length;

  if (negCount > posCount) {
    angles.push(`Contrarian take: most posts about ${kw} are negative — a positive/optimistic angle could stand out`);
  } else if (posCount > negCount) {
    angles.push(`Critical analysis: most posts are hype — a measured critique with specifics could get traction`);
  }

  // Engagement-based angles
  const highEngagement = topPosts.filter((p) => p.engagementRatio > 0.1);
  if (highEngagement.length > 0) {
    angles.push(`Posts about ${kw} generate heavy discussion — aim for a debatable take to maximize comments`);
  }

  // Question opportunity
  const hasQuestions = topPosts.some((p) => p.hasQuestion);
  if (!hasQuestions) {
    angles.push(`No one is asking questions about ${kw} yet — "What does X mean for Y?" could spark discussion`);
  }

  // Numbers/data angle
  const hasNumbers = topPosts.filter((p) => p.hasNumbers).length;
  if (hasNumbers >= 3) {
    angles.push(`Data-driven posts about ${kw} perform well — include specific numbers, benchmarks, or stats`);
  }

  return angles.slice(0, 5);
}

export function getTimingInsights(posts: RedditPost[]): TimingInsight[] {
  const subData: Record<string, { hours: number[]; days: number[]; scores: number[] }> = {};

  for (const p of posts) {
    if (!subData[p.subreddit]) {
      subData[p.subreddit] = { hours: [], days: [], scores: [] };
    }
    const d = new Date(p.pubDate);
    subData[p.subreddit].hours.push(d.getUTCHours());
    subData[p.subreddit].days.push(d.getUTCDay());
    subData[p.subreddit].scores.push(p.score);
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return Object.entries(subData).map(([subreddit, data]) => {
    // Find peak hours
    const hourScores: Record<number, number[]> = {};
    data.hours.forEach((h, i) => {
      if (!hourScores[h]) hourScores[h] = [];
      hourScores[h].push(data.scores[i]);
    });

    const sortedHours = Object.entries(hourScores)
      .map(([h, scores]) => ({
        hour: parseInt(h),
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => b.avg - a.avg);

    const peakHours = sortedHours.slice(0, 3).map((h) => h.hour);

    // Find best day
    const dayCounts: Record<number, number> = {};
    data.days.forEach((d) => {
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
    const bestDayNum = Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0];

    return {
      subreddit,
      peakHours,
      bestDay: bestDayNum ? dayNames[parseInt(bestDayNum[0])] : "Any day",
      avgScoreAtPeak: sortedHours[0]?.avg ? Math.round(sortedHours[0].avg) : 0,
    };
  });
}
