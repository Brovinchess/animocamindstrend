// Scores a Reddit draft based on proven engagement patterns

export interface DraftScore {
  overall: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: ScoreFactor[];
  suggestions: string[];
}

interface ScoreFactor {
  name: string;
  score: number; // 0-100
  weight: number;
  tip: string;
}

export function scoreDraft(title: string, body: string, subreddit: string): DraftScore {
  const factors: ScoreFactor[] = [];
  const suggestions: string[] = [];

  // 1. Title length (sweet spot: 60-150 chars)
  const titleLen = title.length;
  let titleLenScore = 0;
  if (titleLen >= 60 && titleLen <= 150) titleLenScore = 100;
  else if (titleLen >= 40 && titleLen <= 200) titleLenScore = 70;
  else if (titleLen >= 20) titleLenScore = 40;
  else titleLenScore = 10;
  factors.push({
    name: "Title Length",
    score: titleLenScore,
    weight: 0.15,
    tip: titleLen < 60 ? "Longer titles (60-150 chars) get more clicks" : titleLen > 150 ? "Shorten your title — under 150 chars performs best" : "Perfect length",
  });

  // 2. Title has a question
  const hasQuestion = title.includes("?");
  factors.push({
    name: "Question Format",
    score: hasQuestion ? 90 : 40,
    weight: 0.1,
    tip: hasQuestion ? "Questions drive 2x more comments" : "Consider phrasing as a question to boost engagement",
  });

  // 3. Title has numbers/data
  const hasNumbers = /\d/.test(title);
  factors.push({
    name: "Data/Numbers",
    score: hasNumbers ? 85 : 50,
    weight: 0.08,
    tip: hasNumbers ? "Numbers add credibility" : "Adding specific numbers or stats boosts trust",
  });

  // 4. Title emotional trigger
  const emotionalWords = ["amazing", "insane", "incredible", "breaking", "just", "finally", "unpopular", "controversial", "honest", "real", "actually", "nobody", "everyone", "seriously"];
  const hasEmotion = emotionalWords.some((w) => title.toLowerCase().includes(w));
  factors.push({
    name: "Emotional Hook",
    score: hasEmotion ? 85 : 45,
    weight: 0.1,
    tip: hasEmotion ? "Strong emotional hook detected" : "Add words like 'just', 'finally', 'honest', 'actually' to hook readers",
  });

  // 5. Body length
  const bodyWords = body.split(/\s+/).filter(Boolean).length;
  let bodyScore = 0;
  if (bodyWords >= 100 && bodyWords <= 500) bodyScore = 100;
  else if (bodyWords >= 50 && bodyWords <= 800) bodyScore = 75;
  else if (bodyWords >= 20) bodyScore = 50;
  else bodyScore = 15;
  factors.push({
    name: "Body Length",
    score: bodyScore,
    weight: 0.15,
    tip: bodyWords < 50 ? "Add more content — 100-500 words performs best" : bodyWords > 800 ? "Consider trimming — most readers skim after 500 words" : `${bodyWords} words — good length`,
  });

  // 6. Body has structure (bullets, paragraphs, headers)
  const hasBullets = /^[-*•]\s/m.test(body) || /^\d+\.\s/m.test(body);
  const hasParagraphs = (body.match(/\n\n/g) || []).length >= 2;
  const hasHeaders = /\*\*[^*]+\*\*/g.test(body);
  const structureScore = (hasBullets ? 35 : 0) + (hasParagraphs ? 35 : 0) + (hasHeaders ? 30 : 0);
  factors.push({
    name: "Formatting",
    score: Math.min(100, structureScore),
    weight: 0.12,
    tip: !hasBullets && !hasHeaders ? "Add bullet points or **bold headers** — formatted posts get 40% more engagement" : "Good formatting",
  });

  // 7. Call to action / discussion prompt
  const hasCTA = /\?[^?]*$/.test(body) || body.toLowerCase().includes("what do you") || body.toLowerCase().includes("thoughts?") || body.toLowerCase().includes("change my");
  factors.push({
    name: "Discussion Prompt",
    score: hasCTA ? 90 : 30,
    weight: 0.15,
    tip: hasCTA ? "Strong call-to-action for comments" : "End with a question to invite discussion — this is the #1 comment driver",
  });

  // 8. Subreddit fit
  const subScore = subreddit ? 70 : 0;
  factors.push({
    name: "Subreddit Selected",
    score: subScore,
    weight: 0.05,
    tip: subreddit ? `Targeting r/${subreddit}` : "Select a subreddit",
  });

  // 9. Not too salesy / authentic
  const spamWords = ["check out my", "subscribe", "follow me", "link in bio", "buy now", "discount", "promo"];
  const isSpammy = spamWords.some((w) => body.toLowerCase().includes(w));
  factors.push({
    name: "Authenticity",
    score: isSpammy ? 10 : 85,
    weight: 0.1,
    tip: isSpammy ? "Remove promotional language — Reddit heavily penalizes self-promotion" : "Reads authentic",
  });

  // Calculate overall
  const overall = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  );

  // Generate top suggestions from lowest-scoring factors
  const sortedFactors = [...factors].sort((a, b) => a.score - b.score);
  for (const f of sortedFactors) {
    if (f.score < 70 && suggestions.length < 3) {
      suggestions.push(f.tip);
    }
  }

  const grade =
    overall >= 80 ? "A" : overall >= 65 ? "B" : overall >= 50 ? "C" : overall >= 35 ? "D" : "F";

  return { overall, grade, breakdown: factors, suggestions };
}

// Generate multiple title variations for a topic
export function generateTitleVariations(topic: string, originalTitle?: string): string[] {
  const kw = topic.toLowerCase();
  const kwCap = topic.charAt(0).toUpperCase() + topic.slice(1);

  const variations = [
    // Question formats
    `What's the real impact of ${kw} on the industry right now?`,
    `Am I the only one who thinks ${kw} is being overhyped?`,
    `How is ${kw} changing your workflow in practice?`,

    // Personal/story formats
    `I spent a week deep-diving into ${kw} — here's what I learned`,
    `My honest take on ${kw} after following it closely`,
    `${kwCap} isn't what people think — here's what I found`,

    // Data/analysis formats
    `Breaking down the ${kw} situation — 5 key takeaways`,
    `${kwCap}: A practical analysis of what actually matters`,
    `The numbers behind ${kw} that nobody's talking about`,

    // Contrarian/debate formats
    `Unpopular opinion: ${kw} is not going to matter in 6 months`,
    `Hot take: The ${kw} hype is actually justified, here's why`,
    `${kwCap} — the bull case vs the bear case`,

    // Practical/helpful formats
    `Everything you need to know about ${kw} in 2 minutes`,
    `If you're confused about ${kw}, here's a simple breakdown`,
    `${kwCap}: What it means for you and what to do about it`,
  ];

  // If we have an original title, add reaction variations
  if (originalTitle) {
    const short = originalTitle.length > 60 ? originalTitle.slice(0, 60) + "..." : originalTitle;
    variations.unshift(
      `Thoughts on "${short}" — are we overreacting?`,
      `"${short}" — the implications nobody's discussing`,
      `Re: ${short} — my take as someone who's been following this`,
    );
  }

  // Shuffle and return top 8
  return variations.sort(() => Math.random() - 0.5).slice(0, 8);
}

// Suggest subreddits to expand into based on current subs
export function suggestSubreddits(currentSubs: string[]): { name: string; reason: string; size: string }[] {
  const SUBREDDIT_MAP: Record<string, { related: string[]; reason: string }> = {
    chesscom: { related: ["chess", "AnarchyChess", "gaming", "boardgames"], reason: "Related to your chess interest" },
    chessvariants: { related: ["chess", "abstractgames", "boardgames"], reason: "Related to chess variants" },
    chessbeginners: { related: ["chess", "chesscom", "learnchess"], reason: "Chess community" },
    gaming: { related: ["pcgaming", "Games", "truegaming", "patientgamers"], reason: "Gaming communities" },
    technology: { related: ["Futurology", "gadgets", "tech", "science"], reason: "Tech adjacent" },
    programming: { related: ["learnprogramming", "webdev", "coding", "cscareerquestions"], reason: "Dev communities" },
    artificial: { related: ["MachineLearning", "ChatGPT", "singularity", "LocalLLaMA"], reason: "AI communities" },
  };

  // AI subs everyone should consider
  const AI_STARTER_SUBS = [
    { name: "ChatGPT", reason: "Largest AI discussion sub — easy karma with hot takes", size: "5M+" },
    { name: "artificial", reason: "AI news & discussion — good for sharing articles", size: "1.2M+" },
    { name: "singularity", reason: "AGI/future discussions — highly engaged community", size: "800K+" },
    { name: "LocalLLaMA", reason: "Open-source AI — technical but very active", size: "300K+" },
    { name: "technology", reason: "General tech — AI posts do very well here", size: "14M+" },
    { name: "Futurology", reason: "Future tech — AI topics get high engagement", size: "19M+" },
    { name: "ClaudeAI", reason: "Anthropic/Claude — growing fast, less competition", size: "50K+" },
    { name: "OpenAI", reason: "OpenAI community — news breaks here first", size: "400K+" },
  ];

  const currentSet = new Set(currentSubs.map((s) => s.toLowerCase()));
  const suggestions: { name: string; reason: string; size: string }[] = [];

  // Add related subs
  for (const sub of currentSubs) {
    const mapped = SUBREDDIT_MAP[sub.toLowerCase()];
    if (mapped) {
      for (const related of mapped.related) {
        if (!currentSet.has(related.toLowerCase())) {
          suggestions.push({ name: related, reason: mapped.reason, size: "varies" });
          currentSet.add(related.toLowerCase());
        }
      }
    }
  }

  // Add AI starter subs they're not in
  for (const ai of AI_STARTER_SUBS) {
    if (!currentSet.has(ai.name.toLowerCase())) {
      suggestions.push(ai);
      currentSet.add(ai.name.toLowerCase());
    }
  }

  return suggestions.slice(0, 10);
}

// Generate comment drafts for a post
export function generateCommentDrafts(postTitle: string): { angle: string; comment: string }[] {
  const short = postTitle.length > 60 ? postTitle.slice(0, 60) + "..." : postTitle;

  return [
    {
      angle: "Insightful addition",
      comment: `Great point about "${short}". What I think people are missing is [your insight]. This could have bigger implications than most realize because [your reasoning].`,
    },
    {
      angle: "Personal experience",
      comment: `I've actually dealt with this firsthand. In my experience, [your experience]. It's not as straightforward as the headline suggests because [nuance].`,
    },
    {
      angle: "Ask a follow-up question",
      comment: `This is interesting. I'm curious though — how does this compare to [related thing]? And what happens when [scenario]? Would love to hear more perspectives on this.`,
    },
    {
      angle: "Provide context",
      comment: `For anyone who wants more context on this: [additional info]. This has actually been building for a while because [background]. The real thing to watch is [what's next].`,
    },
    {
      angle: "Respectful disagreement",
      comment: `I see the point here but I think it's more nuanced than that. Consider that [counter-argument]. Not saying the original take is wrong, just that [your perspective]. What do others think?`,
    },
  ];
}
