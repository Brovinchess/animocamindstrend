import type { TopicBreakdown } from "./reddit-analytics";

export interface DraftTemplate {
  id: string;
  angle: string;
  title: string;
  body: string;
  targetSub: string;
}

export function generateDrafts(breakdown: TopicBreakdown): DraftTemplate[] {
  const kw = breakdown.topic.keyword;
  const kwCap = kw.charAt(0).toUpperCase() + kw.slice(1);
  const bestSub = breakdown.bestSubreddit.name;
  const topPost = breakdown.topPosts[0]?.post;
  const topPattern = breakdown.patterns[0]?.pattern || "Statement";

  const drafts: DraftTemplate[] = [];

  // 1. Discussion starter — always generate
  drafts.push({
    id: "discussion",
    angle: "Discussion Starter",
    title: `What's everyone's take on the recent ${kw} developments?`,
    body: `Seeing a lot of discussion around ${kw} lately${topPost ? ` — especially "${topPost.title.slice(0, 80)}"` : ""}.\n\nCurious what this community thinks about where this is headed. Is this overhyped or genuinely significant?\n\nWhat's been your experience so far?`,
    targetSub: bestSub,
  });

  // 2. Based on top pattern
  if (topPattern === "Question" || topPattern === "Statement/News") {
    drafts.push({
      id: "hot-take",
      angle: "Hot Take / Opinion",
      title: `Unpopular opinion: ${kwCap} is being overhyped right now`,
      body: `I know ${kw} is the hot topic right now, but I think we need a more nuanced conversation about it.\n\nHere's what I think people are missing:\n\n1. [Your point here]\n2. [Your point here]\n3. [Your point here]\n\nWhat am I getting wrong? Change my view.`,
      targetSub: bestSub,
    });
  }

  // 3. Comparison angle
  if (breakdown.topPosts.length >= 2) {
    const sources = [...new Set(breakdown.topPosts.map((p) => p.post.subreddit))];
    drafts.push({
      id: "comparison",
      angle: "Comparison / Analysis",
      title: `${kwCap}: A comparison of what's actually working vs the hype`,
      body: `I've been following the ${kw} space closely and wanted to share what I've found actually delivers results vs what's just marketing.\n\n**What's actually working:**\n- [Point 1]\n- [Point 2]\n\n**What's overhyped:**\n- [Point 1]\n- [Point 2]\n\nWould love to hear what others have experienced.`,
      targetSub: sources.length > 1 ? sources[1] : bestSub,
    });
  }

  // 4. Personal experience
  drafts.push({
    id: "personal",
    angle: "Personal Experience",
    title: `I've been using ${kw} for [X weeks/months] — here's my honest review`,
    body: `After spending a good amount of time with ${kw}, I wanted to share my experience for anyone on the fence.\n\n**The good:**\n- [What worked well]\n\n**The bad:**\n- [What didn't work]\n\n**Verdict:**\n[Your conclusion]\n\nHappy to answer questions if anyone's considering trying it.`,
    targetSub: bestSub,
  });

  // 5. News reaction — if there's a high-score recent post
  if (topPost && topPost.score > 100) {
    drafts.push({
      id: "reaction",
      angle: "News Reaction",
      title: `Thoughts on "${topPost.title.slice(0, 80)}${topPost.title.length > 80 ? "..." : ""}"`,
      body: `Just saw this and wanted to discuss: ${topPost.link}\n\nMy initial thoughts:\n\n1. [Your reaction]\n2. [What this means for the industry]\n3. [What to watch for next]\n\nWhat do you all think?`,
      targetSub: topPost.subreddit,
    });
  }

  return drafts;
}
