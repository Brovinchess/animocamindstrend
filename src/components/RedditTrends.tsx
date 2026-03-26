"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import type { RedditPost, HotTopic } from "@/lib/reddit";
import { SkeletonReddit } from "./Skeleton";

type ViewMode = "grid" | "list";
type SortBy = "hot" | "newest" | "score" | "comments";

const REDDIT_ORANGE = "#FF4500";

export function RedditTrends() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubreddit, setActiveSubreddit] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("hot");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reddit-bookmarks");
      if (saved) setBookmarks(new Set(JSON.parse(saved)));
      const savedRead = localStorage.getItem("reddit-read");
      if (savedRead) setReadIds(new Set(JSON.parse(savedRead)));
      const savedView = localStorage.getItem("reddit-view");
      if (savedView) setViewMode(savedView as ViewMode);
      const savedSort = localStorage.getItem("reddit-sort");
      if (savedSort) setSortBy(savedSort as SortBy);
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem("reddit-bookmarks", JSON.stringify([...bookmarks])); }, [bookmarks]);
  useEffect(() => { localStorage.setItem("reddit-read", JSON.stringify([...readIds])); }, [readIds]);
  useEffect(() => { localStorage.setItem("reddit-view", viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem("reddit-sort", sortBy); }, [sortBy]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/reddit");
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
        setHotTopics(data.hotTopics);
        setLastUpdated(new Date());
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    const handleRefresh = () => load();
    window.addEventListener("reddit-refresh", handleRefresh);
    return () => { clearInterval(interval); window.removeEventListener("reddit-refresh", handleRefresh); };
  }, [load]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast("Bookmark removed"); }
      else { next.add(id); showToast("Bookmarked!"); }
      return next;
    });
  }, [showToast]);

  const markRead = useCallback((id: string) => {
    setReadIds(prev => new Set(prev).add(id));
  }, []);

  const tweetPost = useCallback((post: RedditPost) => {
    const text = `${post.title}\n\n${post.link}\n\nvia r/${post.subreddit} (${post.score} pts, ${post.comments} comments)`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }, []);

  const activeSubs = useMemo(() => [...new Set(posts.map(p => p.subreddit))], [posts]);

  const filtered = useMemo(() => {
    let items = [...posts];
    if (showBookmarksOnly) items = items.filter(p => bookmarks.has(p.id));
    if (activeSubreddit) items = items.filter(p => p.subreddit === activeSubreddit);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p => p.title.toLowerCase().includes(q) || p.subreddit.toLowerCase().includes(q) || p.author.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "hot": items.sort((a, b) => b.heatScore - a.heatScore); break;
      case "score": items.sort((a, b) => b.score - a.score); break;
      case "newest": items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()); break;
      case "comments": items.sort((a, b) => b.comments - a.comments); break;
    }
    return items;
  }, [posts, activeSubreddit, search, sortBy, showBookmarksOnly, bookmarks]);

  const unreadCount = posts.filter(p => !readIds.has(p.id)).length;

  return (
    <section>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-tab-in rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg" style={{ background: REDDIT_ORANGE }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(255,69,0,0.1)" }}>
            <svg className="h-4 w-4" style={{ color: REDDIT_ORANGE }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.806 1.304 3.49.997.108-.776.42-1.305.763-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Reddit Trends</h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>AI discussions across Reddit</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        <div className="flex items-center gap-3">
          <span>{filtered.length} posts</span>
          <span>{activeSubs.length} subreddits</span>
          {unreadCount > 0 && <span className="font-medium" style={{ color: REDDIT_ORANGE }}>{unreadCount} unread</span>}
          {lastUpdated && <span>Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>}
        </div>
        <button onClick={() => { setLoading(true); load(); }} className="flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: REDDIT_ORANGE }}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {loading && <SkeletonReddit />}

      {!loading && (
        <>
          {/* Hot Topics */}
          {hotTopics.length > 0 && !showBookmarksOnly && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {hotTopics.map((topic) => (
                  <div key={topic.keyword} className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-[var(--surface-hover)]" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
                    <span className="text-sm">{topic.signal === "fire" ? "🔥" : topic.signal === "rising" ? "📈" : "🌡️"}</span>
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{topic.keyword}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        {topic.count} posts · avg {topic.avgScore} pts · {topic.subreddits.length} subs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subreddit filter */}
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button onClick={() => setActiveSubreddit(null)} className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all" style={!activeSubreddit ? { background: REDDIT_ORANGE, color: "#fff" } : { background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
              All
            </button>
            {activeSubs.map((sub) => (
              <button key={sub} onClick={() => setActiveSubreddit(activeSubreddit === sub ? null : sub)} className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all" style={activeSubreddit === sub ? { background: REDDIT_ORANGE, color: "#fff" } : { background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                r/{sub}
              </button>
            ))}
          </div>

          {/* Controls: Search + Sort + View + Bookmarks */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none transition-colors focus:ring-2"
                style={{ background: "var(--surface-card)", borderColor: "var(--border)", color: "var(--text-primary)", "--tw-ring-color": REDDIT_ORANGE } as React.CSSProperties}
              />
            </div>

            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              {([["hot", "Hot"], ["score", "Top"], ["newest", "New"], ["comments", "Comments"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setSortBy(key)} className="px-3 py-2 text-[11px] font-medium transition-colors" style={sortBy === key ? { background: REDDIT_ORANGE, color: "#fff" } : { background: "var(--surface-card)", color: "var(--text-secondary)" }}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setViewMode("list")} className="px-2.5 py-2 transition-colors" style={viewMode === "list" ? { background: REDDIT_ORANGE, color: "#fff" } : { background: "var(--surface-card)", color: "var(--text-secondary)" }}>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
              <button onClick={() => setViewMode("grid")} className="px-2.5 py-2 transition-colors" style={viewMode === "grid" ? { background: REDDIT_ORANGE, color: "#fff" } : { background: "var(--surface-card)", color: "var(--text-secondary)" }}>
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
            </div>

            <button onClick={() => setShowBookmarksOnly(!showBookmarksOnly)} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium transition-colors" style={showBookmarksOnly ? { background: "#f59e0b", color: "#fff", borderColor: "#f59e0b" } : { background: "var(--surface-card)", color: "var(--text-secondary)", borderColor: "var(--border)" }}>
              <svg className="h-3.5 w-3.5" fill={showBookmarksOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {bookmarks.size > 0 && bookmarks.size}
            </button>
          </div>

          {/* Empty */}
          {filtered.length === 0 && (
            <div className="rounded-xl border-2 border-dashed p-8 text-center" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                {search ? "No matching posts" : showBookmarksOnly ? "No bookmarked posts" : "No posts found"}
              </p>
            </div>
          )}

          {/* List View */}
          {filtered.length > 0 && viewMode === "list" && (
            <div className="rounded-xl border overflow-hidden divide-y" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
              {filtered.map((post) => {
                const isExpanded = expandedId === post.id;
                const isRead = readIds.has(post.id);
                const isBookmarked = bookmarks.has(post.id);
                return (
                  <div key={post.id}>
                    <div
                      className="flex items-start gap-3 px-4 py-3.5 group transition-colors hover:bg-[var(--surface-hover)] cursor-pointer"
                      onClick={() => { setExpandedId(isExpanded ? null : post.id); markRead(post.id); }}
                    >
                      {/* Score */}
                      <div className="flex flex-col items-center shrink-0 w-10 pt-0.5">
                        <svg className="h-3 w-3" style={{ color: REDDIT_ORANGE }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                          {post.score > 999 ? `${(post.score / 1000).toFixed(1)}k` : post.score}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <span className={`text-[13px] font-medium leading-snug transition-colors ${isRead ? "opacity-60" : ""}`} style={{ color: "var(--text-primary)" }}>
                          {post.title}
                          {isRead && <span className="ml-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>✓</span>}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium" style={{ color: REDDIT_ORANGE }}>r/{post.subreddit}</span>
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>u/{post.author}</span>
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{safeTimeAgo(post.pubDate)}</span>
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{post.comments} comments</span>
                          {post.heatScore > 50 && <span className="text-[10px]">🔥</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); toggleBookmark(post.id); }} className="p-1.5 rounded-md transition-colors hover:bg-[var(--surface-muted)]">
                          <svg className="h-3.5 w-3.5" fill={isBookmarked ? "#f59e0b" : "none"} stroke={isBookmarked ? "#f59e0b" : "currentColor"} style={{ color: "var(--text-muted)" }} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); tweetPost(post); }} className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--surface-muted)]" title="Post to X">
                          <svg className="h-3.5 w-3.5" style={{ color: "var(--text-secondary)" }} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </button>
                        <svg className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
                        <div className="pl-[52px]">
                          {post.selftext && (
                            <p className="text-[13px] leading-relaxed mb-3 whitespace-pre-wrap line-clamp-6" style={{ color: "var(--text-secondary)" }}>
                              {post.selftext}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <a href={post.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:opacity-80" style={{ background: REDDIT_ORANGE, color: "#fff" }}>
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              Open on Reddit
                            </a>
                            <button onClick={() => tweetPost(post)} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              Post to X
                            </button>
                            <button
                              onClick={() => { navigator.clipboard.writeText(`${post.title}\n${post.link}`); showToast("Copied!"); }}
                              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                              Copy Link
                            </button>
                          </div>
                          <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            <span><strong style={{ color: "var(--text-primary)" }}>{post.score}</strong> points</span>
                            <span>{post.comments} comments</span>
                            <span>by <strong style={{ color: "var(--text-primary)" }}>u/{post.author}</strong></span>
                            <span>{safeTimeAgo(post.pubDate)}</span>
                            {post.heatScore > 50 && <span>🔥 Heat: {post.heatScore}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid View */}
          {filtered.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((post) => {
                const isRead = readIds.has(post.id);
                const isBookmarked = bookmarks.has(post.id);
                return (
                  <div
                    key={post.id}
                    className="group rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer"
                    style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
                    onClick={() => { markRead(post.id); window.open(post.link, "_blank"); }}
                  >
                    {/* Top: subreddit + actions */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium" style={{ color: REDDIT_ORANGE }}>r/{post.subreddit}</span>
                        <div className="flex items-center gap-1">
                          <svg className="h-3 w-3" style={{ color: REDDIT_ORANGE }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                            {post.score > 999 ? `${(post.score / 1000).toFixed(1)}k` : post.score}
                          </span>
                        </div>
                        {post.heatScore > 50 && <span className="text-[10px]">🔥</span>}
                        {isRead && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>✓</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); toggleBookmark(post.id); }} className="p-1 rounded-md hover:bg-[var(--surface-muted)]">
                          <svg className="h-3.5 w-3.5" fill={isBookmarked ? "#f59e0b" : "none"} stroke={isBookmarked ? "#f59e0b" : "currentColor"} style={{ color: "var(--text-muted)" }} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); tweetPost(post); }} className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--surface-muted)]">
                          <svg className="h-3.5 w-3.5" style={{ color: "var(--text-secondary)" }} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-[13px] font-medium leading-snug mb-2 line-clamp-2 transition-colors ${isRead ? "opacity-60" : ""}`} style={{ color: "var(--text-primary)" }}>
                      {post.title}
                    </h3>

                    {/* Self text preview */}
                    {post.selftext && (
                      <p className="text-[11px] leading-relaxed mb-2 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>
                        {post.selftext}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      <span>u/{post.author}</span>
                      <span style={{ color: "var(--text-muted)" }}>·</span>
                      <span>{safeTimeAgo(post.pubDate)}</span>
                    </div>

                    {/* Bottom */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
