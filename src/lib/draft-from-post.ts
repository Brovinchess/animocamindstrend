// Generate a unique draft inspired by an existing Reddit post
// The draft should be similar in topic but different in angle and wording

interface PostInput {
  title: string;
  subreddit: string;
  score: number;
  comments: number;
  selftext?: string;
  link?: string;
}

interface GeneratedDraft {
  title: string;
  body: string;
}

const ANGLES = [
  "question",
  "personal",
  "counterpoint",
  "deeper-dive",
  "practical",
] as const;

function pickAngle(title: string): typeof ANGLES[number] {
  const lower = title.toLowerCase();
  // Pick an angle that's DIFFERENT from the original
  if (lower.includes("?") || lower.match(/^(what|how|why|who|when)/)) {
    // Original is a question — respond with a personal take or counterpoint
    return Math.random() > 0.5 ? "personal" : "counterpoint";
  }
  if (lower.match(/shut down|dead|fail|disappoint|problem|ban/)) {
    // Original is negative news — go deeper or ask a question
    return Math.random() > 0.5 ? "deeper-dive" : "question";
  }
  if (lower.match(/launch|release|new|introducing|announce/)) {
    // Original is announcement — share practical experience or question
    return Math.random() > 0.5 ? "practical" : "question";
  }
  // Default: random angle
  return ANGLES[Math.floor(Math.random() * ANGLES.length)];
}

function generateTitle(original: string, angle: typeof ANGLES[number]): string {
  // Extract the core subject from the title
  const subject = original
    .replace(/^(breaking|update|news|psa|til|reminder):\s*/i, "")
    .replace(/[?!.]+$/, "")
    .trim();

  // Shorten subject if too long
  const shortSubject = subject.length > 60 ? subject.slice(0, 60).replace(/\s\S*$/, "...") : subject;

  switch (angle) {
    case "question":
      return pickRandom([
        `What does everyone think about ${shortSubject}?`,
        `Am I the only one concerned about ${shortSubject}?`,
        `How will ${shortSubject} impact the industry long term?`,
        `Can someone explain the significance of ${shortSubject}?`,
        `${shortSubject} — what are we not talking about?`,
      ]);
    case "personal":
      return pickRandom([
        `My experience with ${shortSubject} — not what I expected`,
        `I've been following ${shortSubject} closely — here's my take`,
        `${shortSubject} changed how I think about this space`,
        `After looking into ${shortSubject}, here's what stood out to me`,
      ]);
    case "counterpoint":
      return pickRandom([
        `Unpopular take: ${shortSubject} isn't as big a deal as people think`,
        `The other side of ${shortSubject} that nobody's talking about`,
        `I think people are overreacting to ${shortSubject}`,
        `${shortSubject} — a more nuanced perspective`,
      ]);
    case "deeper-dive":
      return pickRandom([
        `Breaking down what ${shortSubject} actually means`,
        `${shortSubject} — the bigger picture everyone's missing`,
        `A closer look at ${shortSubject} and what comes next`,
        `The real implications of ${shortSubject}`,
      ]);
    case "practical":
      return pickRandom([
        `How ${shortSubject} affects you in practice`,
        `What ${shortSubject} means if you're a developer/user`,
        `Practical takeaways from ${shortSubject}`,
        `${shortSubject} — here's what you should actually do about it`,
      ]);
  }
}

function generateBody(original: PostInput, angle: typeof ANGLES[number]): string {
  const shortTitle = original.title.length > 80
    ? original.title.slice(0, 80) + "..."
    : original.title;

  switch (angle) {
    case "question":
      return [
        `With all the buzz around "${shortTitle}", I'm curious what this community thinks.`,
        "",
        "A few things I've been wondering:",
        "",
        "1. Is this actually going to change anything, or is it just hype?",
        "2. What are the real-world implications here?",
        "3. How does this compare to what we've seen before?",
        "",
        "I have my own thoughts but would love to hear different perspectives first.",
        "",
        "What's your take?",
      ].join("\n");

    case "personal":
      return [
        `Been following the news about "${shortTitle}" and wanted to share my perspective since I don't see enough people talking about this angle.`,
        "",
        "**What caught my attention:**",
        "- [Your observation about this topic]",
        "- [Something most people aren't considering]",
        "",
        "**My experience with this:**",
        "- [What you've personally seen or done related to this]",
        "",
        "**What I think happens next:**",
        "- [Your prediction]",
        "",
        "Curious if anyone else has had a similar experience or sees it differently.",
      ].join("\n");

    case "counterpoint":
      return [
        `I know "${shortTitle}" is getting a lot of attention right now, but I think the reaction is a bit overblown. Here's why:`,
        "",
        "**What people are saying:**",
        "Most of the discussion seems to focus on [the mainstream take]. And sure, that's valid on the surface.",
        "",
        "**What I think is actually going on:**",
        "1. [Your counterargument]",
        "2. [Context that's being missed]",
        "3. [Why the mainstream take might be wrong]",
        "",
        "I'm not saying this isn't significant — I just think we need a more balanced view.",
        "",
        "Change my mind?",
      ].join("\n");

    case "deeper-dive":
      return [
        `"${shortTitle}" has been all over the feeds, so I wanted to dig deeper into what this actually means.`,
        "",
        "**The surface-level story:**",
        "Everyone's talking about [the obvious takeaway]. But there's more to it.",
        "",
        "**What I found when I looked closer:**",
        "- [Insight 1 — something non-obvious]",
        "- [Insight 2 — a connection most people missed]",
        "- [Insight 3 — what this signals for the future]",
        "",
        "**The bigger picture:**",
        "[How this fits into the broader trend]",
        "",
        "Would love to hear if anyone has additional context I'm missing.",
      ].join("\n");

    case "practical":
      return [
        `With "${shortTitle}" making the rounds, I wanted to break down what this actually means in practice.`,
        "",
        "**If you're a developer/user, here's what matters:**",
        "- [Practical impact 1]",
        "- [Practical impact 2]",
        "",
        "**What you should consider doing:**",
        "1. [Action item 1]",
        "2. [Action item 2]",
        "3. [Action item 3]",
        "",
        "**What you can probably ignore:**",
        "- [Overhyped aspect that doesn't matter yet]",
        "",
        "Anyone already making changes based on this? What's your approach?",
      ].join("\n");
  }
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function draftSimilarPost(post: PostInput): GeneratedDraft {
  const angle = pickAngle(post.title);
  return {
    title: generateTitle(post.title, angle),
    body: generateBody(post, angle),
  };
}

export function buildRedditSubmitUrl(subreddit: string, title: string, body: string): string {
  // Use old.reddit.com — it reliably pre-fills both title AND body text
  // New reddit sometimes ignores the text parameter
  return `https://old.reddit.com/r/${subreddit}/submit?selftext=true&title=${encodeURIComponent(title)}&text=${encodeURIComponent(body)}`;
}
