"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import type { HNStory } from "@/lib/hackernews";
import { SkeletonReddit } from "./Skeleton";

type ViewMode = "grid" | "list";
type SortBy = "score" | "newest" | "comments";

const HN_ORANGE = "#FF6600";

export function HackerNewsFeed() {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("score");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hn-bookmarks");
      if (saved) setBookmarks(new Set(JSON.parse(saved)));
      const savedRead = localStorage.getItem("hn-read");
      if (savedRead) setReadIds(new Set(JSON.parse(savedRead)));
      const savedView = localStorage.getItem("hn-view");
      if (savedView) setViewMode(savedView as ViewMode);
      const savedSort = localStorage.getItem("hn-sort");
      if (savedSort) setSortBy(savedSort as SortBy);
    } catch {}
  }, []);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem("hn-bookmarks", JSON.stringify([...bookmarks]));
  }, [bookmarks]);
  useEffect(() => {
    localStorage.setItem("hn-read", JSON.stringify([...readIds]));
  }, [readIds]);
  useEffect(() => {
    localStorage.setItem("hn-view", viewMode);
  }, [viewMode]);
  useEffect(() => {
    localStorage.setItem("hn-sort", sortBy);
  }, [sortBy]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/hackernews");
      const data = await res.json();
      if (data.success) {
        setStories(data.stories);
        setLastUpdated(new Date());
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const toggleBookmark = useCallback((id: number) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast("Bookmark removed"); }
      else { next.add(id); showToast("Bookmarked!"); }
      return next;
    });
  }, [showToast]);

  const markRead = useCallback((id: number) => {
    setReadIds(prev => new Set(prev).add(id));
  }, []);

  const tweetStory = useCallback((story: HNStory) => {
    const text = `${story.title}\n\n${story.url}\n\nvia Hacker News (${story.score} pts)`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }, []);

  const filtered = useMemo(() => {
    let items = [...stories];
    if (showBookmarksOnly) items = items.filter(s => bookmarks.has(s.id));
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(s => s.title.toLowerCase().includes(q) || s.by.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "score": items.sort((a, b) => b.score - a.score); break;
      case "newest": items.sort((a, b) => b.time - a.time); break;
      case "comments": items.sort((a, b) => b.descendants - a.descendants); break;
    }
    return items;
  }, [stories, search, sortBy, showBookmarksOnly, bookmarks]);

  const unreadCount = stories.filter(s => !readIds.has(s.id)).length;

  return (
    <section>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-tab-in rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg" style={{ background: HN_ORANGE }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(255,102,0,0.1)" }}>
            <svg className="h-4 w-4" style={{ color: HN_ORANGE }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 0v24h24V0H0zm12.8 14.4v5.1H11V14.4L6.2 4.5h2.1l3.6 7.5 3.6-7.5h2.1l-4.8 9.9z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Hacker News</h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Top tech & AI stories</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        <div className="flex items-center gap-3">
          <span>{filtered.length} stories</span>
          {unreadCount > 0 && <span className="font-medium" style={{ color: HN_ORANGE }}>{unreadCount} unread</span>}
          {lastUpdated && <span>Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}</span>}
        </div>
        <button onClick={() => { setLoading(true); load(); }} className="flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: HN_ORANGE }}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      {/* Controls: Search + Sort + View + Bookmarks */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none transition-colors focus:ring-2"
            style={{ background: "var(--surface-card)", borderColor: "var(--border)", color: "var(--text-primary)", "--tw-ring-color": HN_ORANGE } as React.CSSProperties}
          />
        </div>

        {/* Sort */}
        <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          {([["score", "Top"], ["newest", "New"], ["comments", "Comments"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className="px-3 py-2 text-[11px] font-medium transition-colors"
              style={sortBy === key
                ? { background: HN_ORANGE, color: "#fff" }
                : { background: "var(--surface-card)", color: "var(--text-secondary)" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* View mode */}
        <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setViewMode("list")} className="px-2.5 py-2 transition-colors" style={viewMode === "list" ? { background: HN_ORANGE, color: "#fff" } : { background: "var(--surface-card)", color: "var(--text-secondary)" }}>
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
          </button>
          <button onClick={() => setViewMode("grid")} className="px-2.5 py-2 transition-colors" style={viewMode === "grid" ? { background: HN_ORANGE, color: "#fff" } : { background: "var(--surface-card)", color: "var(--text-secondary)" }}>
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>

        {/* Bookmarks filter */}
        <button
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium transition-colors"
          style={showBookmarksOnly
            ? { background: "#f59e0b", color: "#fff", borderColor: "#f59e0b" }
            : { background: "var(--surface-card)", color: "var(--text-secondary)", borderColor: "var(--border)" }}
        >
          <svg className="h-3.5 w-3.5" fill={showBookmarksOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {bookmarks.size > 0 && bookmarks.size}
        </button>
      </div>

      {/* Loading */}
      {loading && <SkeletonReddit />}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
            {search ? "No matching stories" : showBookmarksOnly ? "No bookmarked stories" : "No stories found"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {search ? "Try a different search term" : "Stories will appear shortly"}
          </p>
        </div>
      )}

      {/* List View */}
      {!loading && filtered.length > 0 && viewMode === "list" && (
        <div className="rounded-xl border overflow-hidden divide-y" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
          {filtered.map((story, idx) => {
            const isExpanded = expandedId === story.id;
            const isRead = readIds.has(story.id);
            const isBookmarked = bookmarks.has(story.id);
            return (
              <div key={story.id}>
                <div
                  className="flex items-start gap-3 px-4 py-3.5 group transition-colors hover:bg-[var(--surface-hover)] cursor-pointer"
                  onClick={() => { setExpandedId(isExpanded ? null : story.id); markRead(story.id); }}
                >
                  {/* Rank + Score */}
                  <div className="flex flex-col items-center shrink-0 w-10 pt-0.5">
                    <span className="text-[10px] font-medium mb-0.5" style={{ color: "var(--text-muted)" }}>#{idx + 1}</span>
                    <div className="flex items-center gap-0.5">
                      <svg className="h-3 w-3" style={{ color: HN_ORANGE }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{story.score}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <span className={`text-[13px] font-medium leading-snug transition-colors ${isRead ? "opacity-60" : ""}`} style={{ color: "var(--text-primary)" }}>
                      {story.title}
                      {isRead && <span className="ml-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>✓</span>}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>by {story.by}</span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{formatDistanceToNow(new Date(story.time * 1000), { addSuffix: true })}</span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{story.descendants} comments</span>
                      {story.url && !story.url.includes("ycombinator") && (
                        <>
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                          <span className="text-[10px] rounded-full px-2 py-0.5 font-medium" style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}>
                            {new URL(story.url).hostname.replace("www.", "")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(story.id); }}
                      className="p-1.5 rounded-md transition-colors hover:bg-[var(--surface-muted)]"
                      title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                    >
                      <svg className="h-3.5 w-3.5" fill={isBookmarked ? "#f59e0b" : "none"} stroke={isBookmarked ? "#f59e0b" : "currentColor"} style={{ color: "var(--text-muted)" }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); tweetStory(story); }}
                      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--surface-muted)]"
                      title="Post to X"
                    >
                      <svg className="h-3.5 w-3.5" style={{ color: "var(--text-secondary)" }} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                    <svg className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
                    <div className="pl-[52px]">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <a href={story.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:opacity-80" style={{ background: HN_ORANGE, color: "#fff" }}>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          Read Article
                        </a>
                        <a href={story.hnUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          {story.descendants} Comments on HN
                        </a>
                        <button onClick={() => tweetStory(story)} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          Post to X
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(`${story.title}\n${story.url}`); showToast("Copied!"); }}
                          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          Copy Link
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        <span><strong style={{ color: "var(--text-primary)" }}>{story.score}</strong> points</span>
                        <span>by <strong style={{ color: "var(--text-primary)" }}>{story.by}</strong></span>
                        <span>{formatDistanceToNow(new Date(story.time * 1000), { addSuffix: true })}</span>
                        {story.url && !story.url.includes("ycombinator") && (
                          <span className="rounded-full px-2 py-0.5" style={{ background: "var(--surface-card)" }}>
                            {new URL(story.url).hostname.replace("www.", "")}
                          </span>
                        )}
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
      {!loading && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((story, idx) => {
            const isRead = readIds.has(story.id);
            const isBookmarked = bookmarks.has(story.id);
            return (
              <div
                key={story.id}
                className="group rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer"
                style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
                onClick={() => { markRead(story.id); window.open(story.url, "_blank"); }}
              >
                {/* Top row: rank + actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "rgba(255,102,0,0.1)", color: HN_ORANGE }}>#{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <svg className="h-3 w-3" style={{ color: HN_ORANGE }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{story.score}</span>
                    </div>
                    {isRead && <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>✓</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); toggleBookmark(story.id); }} className="p-1 rounded-md hover:bg-[var(--surface-muted)]">
                      <svg className="h-3.5 w-3.5" fill={isBookmarked ? "#f59e0b" : "none"} stroke={isBookmarked ? "#f59e0b" : "currentColor"} style={{ color: "var(--text-muted)" }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); tweetStory(story); }} className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--surface-muted)]">
                      <svg className="h-3.5 w-3.5" style={{ color: "var(--text-secondary)" }} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className={`text-[13px] font-medium leading-snug mb-2 line-clamp-2 group-hover:text-[${HN_ORANGE}] transition-colors ${isRead ? "opacity-60" : ""}`} style={{ color: "var(--text-primary)" }}>
                  {story.title}
                </h3>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                  <span>by {story.by}</span>
                  <span style={{ color: "var(--text-muted)" }}>·</span>
                  <span>{formatDistanceToNow(new Date(story.time * 1000), { addSuffix: true })}</span>
                </div>

                {/* Bottom */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      {story.descendants}
                    </span>
                  </div>
                  {story.url && !story.url.includes("ycombinator") && (
                    <span className="text-[10px] rounded-full px-2 py-0.5" style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}>
                      {new URL(story.url).hostname.replace("www.", "")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
