"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import type { RedditPost, HotTopic } from "@/lib/reddit";
import { draftSimilarPost, buildRedditSubmitUrl } from "@/lib/draft-from-post";
import { SkeletonReddit } from "./Skeleton";

export function RedditTrends() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubreddit, setActiveSubreddit] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reddit");
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts);
          setHotTopics(data.hotTopics);
        }
      } catch {}
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30 * 60 * 1000); // 30 min
    const handleRefresh = () => load();
    window.addEventListener("reddit-refresh", handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("reddit-refresh", handleRefresh);
    };
  }, []);

  const filtered = activeSubreddit
    ? posts.filter((p) => p.subreddit === activeSubreddit)
    : posts;

  const visible = showAll ? filtered : filtered.slice(0, 20);

  // Get unique subreddits that returned data
  const activeSubs = [...new Set(posts.map((p) => p.subreddit))];

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(255,69,0,0.1)" }}>
            <svg className="h-4 w-4 text-[#FF4500]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.806 1.304 3.49.997.108-.776.42-1.305.763-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Reddit Trends</h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>AI discussions across Reddit</p>
          </div>
        </div>
        {posts.length > 0 && (
          <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "rgba(255,69,0,0.1)", color: "#FF4500" }}>
            {activeSubs.length} subs · {posts.length} posts
          </span>
        )}
      </div>

      {loading && <SkeletonReddit />}

      {!loading && (
        <>
          {/* Hot Topics — what to post about */}
          {hotTopics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
                Hot Topics Right Now — Best to post about
              </h3>
              <div className="flex flex-wrap gap-2">
                {hotTopics.map((topic) => (
                  <div
                    key={topic.keyword}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-[var(--surface-hover)]"
                    style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
                  >
                    <span className="text-sm">
                      {topic.signal === "fire" ? "🔥" : topic.signal === "rising" ? "📈" : "🌡️"}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                        {topic.keyword}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        {topic.count} posts · avg {topic.avgScore} pts · {topic.avgComments} comments · {topic.subreddits.length} subs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subreddit filter */}
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
            <button
              onClick={() => setActiveSubreddit(null)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                !activeSubreddit ? "bg-[#FF4500] text-white" : ""
              }`}
              style={activeSubreddit ? { background: "var(--surface-muted)", color: "var(--text-secondary)" } : undefined}
            >
              All
            </button>
            {activeSubs.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubreddit(activeSubreddit === sub ? null : sub)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeSubreddit === sub ? "bg-[#FF4500] text-white" : ""
                }`}
                style={activeSubreddit !== sub ? { background: "var(--surface-muted)", color: "var(--text-secondary)" } : undefined}
              >
                r/{sub}
              </button>
            ))}
          </div>

          {/* Posts list */}
          <div
            className="rounded-xl border overflow-hidden divide-y"
            style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
          >
            {visible.map((post) => {
              const draft = draftSimilarPost(post);
              const draftUrl = buildRedditSubmitUrl(post.subreddit, draft.title, draft.body);

              return (
                <div
                  key={post.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover)] group"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* Score */}
                  <div className="flex flex-col items-center shrink-0 w-10 pt-0.5">
                    <svg className="h-3 w-3 text-[#FF4500]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {post.score > 999 ? `${(post.score / 1000).toFixed(1)}k` : post.score}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-medium leading-snug mb-1 hover:text-[#FF4500] transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {post.title}
                    </a>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] font-medium text-[#FF4500]">r/{post.subreddit}</span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>u/{post.author}</span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{safeTimeAgo(post.pubDate)}</span>
                    </div>
                  </div>

                  {/* Engagement + Draft button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-[11px]">{post.comments}</span>
                    </div>
                    {post.heatScore > 50 && (
                      <span className="text-[10px] font-semibold text-[#FF4500]">🔥</span>
                    )}
                    <a
                      href={draftUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md bg-[#FF4500] px-2 py-1 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#e03d00]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Draft
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more */}
          {!showAll && filtered.length > 20 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 w-full rounded-lg border py-2.5 text-xs font-medium transition-all hover:bg-[var(--surface-hover)] active:scale-[0.99]"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
            >
              Show all {filtered.length} posts
            </button>
          )}
        </>
      )}
    </section>
  );
}

function safeTimeAgo(date: string) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}
