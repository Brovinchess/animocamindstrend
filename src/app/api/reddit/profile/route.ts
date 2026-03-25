import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SubredditKarma {
  sr: string;
  comment_karma: number;
  link_karma: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ success: false, error: "Username required" }, { status: 400 });
  }

  try {
    // Fetch user profile
    const [aboutRes, postsRes] = await Promise.all([
      fetch(`https://www.reddit.com/user/${username}/about.json`, {
        headers: { "User-Agent": "animocaminds:v1.0 (by /u/animocaminds)" },
      }),
      fetch(`https://www.reddit.com/user/${username}/submitted.json?limit=25&sort=top&t=all`, {
        headers: { "User-Agent": "animocaminds:v1.0 (by /u/animocaminds)" },
      }),
    ]);

    if (!aboutRes.ok) {
      return NextResponse.json({ success: false, error: "User not found or rate limited" }, { status: 404 });
    }

    const about = await aboutRes.json();
    const userData = about?.data;

    // Parse top posts to understand posting patterns
    let topSubs: Record<string, { posts: number; totalScore: number }> = {};
    let topPostTitles: string[] = [];

    if (postsRes.ok) {
      const postsData = await postsRes.json();
      const posts = postsData?.data?.children || [];

      for (const p of posts) {
        const d = p.data;
        const sub = d.subreddit;
        if (!topSubs[sub]) topSubs[sub] = { posts: 0, totalScore: 0 };
        topSubs[sub].posts++;
        topSubs[sub].totalScore += d.score;
        topPostTitles.push(d.title);
      }
    }

    // Sort subs by total score
    const sortedSubs = Object.entries(topSubs)
      .map(([name, data]) => ({
        name,
        posts: data.posts,
        totalScore: data.totalScore,
        avgScore: Math.round(data.totalScore / data.posts),
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    // Analyze what topics the user posts about
    const AI_KEYWORDS = [
      "ai", "gpt", "claude", "llm", "model", "openai", "anthropic", "gemini",
      "machine learning", "deep learning", "neural", "training", "inference",
      "chatbot", "automation", "robot", "agent", "coding", "programming",
    ];

    const topicAffinity: Record<string, number> = {};
    for (const title of topPostTitles) {
      const lower = title.toLowerCase();
      for (const kw of AI_KEYWORDS) {
        if (lower.includes(kw)) {
          topicAffinity[kw] = (topicAffinity[kw] || 0) + 1;
        }
      }
    }

    // Fetch hot posts from the user's top subreddits
    const userSubNames = sortedSubs.slice(0, 5).map((s) => s.name);
    const hotFromYourSubs: { title: string; score: number; comments: number; subreddit: string; link: string; author: string; pubDate: string }[] = [];

    // Fetch in sequence with small delay to avoid rate limit
    for (const subName of userSubNames) {
      try {
        const hotRes = await fetch(
          `https://www.reddit.com/r/${subName}/hot.json?limit=10`,
          {
            headers: { "User-Agent": "animocaminds:v1.0 (by /u/animocaminds)" },
            signal: AbortSignal.timeout(8000),
          }
        );
        if (hotRes.ok) {
          const hotData = await hotRes.json();
          const children = hotData?.data?.children || [];
          for (const c of children) {
            const d = c.data;
            if (d.stickied) continue;
            hotFromYourSubs.push({
              title: d.title,
              score: d.score,
              comments: d.num_comments,
              subreddit: d.subreddit,
              link: `https://reddit.com${d.permalink}`,
              author: d.author,
              pubDate: new Date(d.created_utc * 1000).toISOString(),
            });
          }
        }
        // Small delay between requests
        await new Promise((r) => setTimeout(r, 500));
      } catch {}
    }

    // Sort by score
    hotFromYourSubs.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      profile: {
        username: userData?.name,
        totalKarma: (userData?.link_karma || 0) + (userData?.comment_karma || 0),
        linkKarma: userData?.link_karma || 0,
        commentKarma: userData?.comment_karma || 0,
        accountAge: userData?.created_utc
          ? Math.floor((Date.now() / 1000 - userData.created_utc) / 86400)
          : 0,
        isGold: userData?.is_gold || false,
      },
      topSubreddits: sortedSubs.slice(0, 10),
      hotFromYourSubs: hotFromYourSubs.slice(0, 15),
      topicAffinity: Object.entries(topicAffinity)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count })),
      recommendations: generateRecommendations(sortedSubs, topicAffinity),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

function generateRecommendations(
  topSubs: { name: string; posts: number; totalScore: number; avgScore: number }[],
  topicAffinity: Record<string, number>
): string[] {
  const recs: string[] = [];

  if (topSubs.length > 0) {
    const bestSub = topSubs[0];
    recs.push(`Your best performing sub is r/${bestSub.name} (avg ${bestSub.avgScore} pts) — prioritize posting there`);
  }

  if (topSubs.length > 2) {
    const diverseSubs = topSubs.filter((s) => s.posts >= 2);
    if (diverseSubs.length > 0) {
      recs.push(`You have consistent karma in: ${diverseSubs.map((s) => `r/${s.name}`).join(", ")}`);
    }
  }

  const aiTopics = Object.keys(topicAffinity);
  if (aiTopics.length > 0) {
    recs.push(`Your strongest AI topics: ${aiTopics.slice(0, 5).join(", ")} — stick to these for higher engagement`);
  } else {
    recs.push(`You haven't posted much about AI yet — start with trending topics in r/artificial or r/ChatGPT`);
  }

  recs.push(`Tip: Posts that ask questions or share personal experiences tend to get 2-3x more engagement than link posts`);

  return recs;
}
