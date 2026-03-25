"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import type { HNStory } from "@/lib/hackernews";
import { SkeletonReddit } from "./Skeleton";

export function HackerNewsFeed() {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/hackernews");
        const data = await res.json();
        if (data.success) setStories(data.stories);
      } catch {}
      setLoading(false);
    }
    load();

    const interval = setInterval(load, 30 * 60 * 1000);
    const handleRefresh = () => { setLoading(true); load(); };
    window.addEventListener("reddit-refresh", handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("reddit-refresh", handleRefresh);
    };
  }, []);

  const visible = showAll ? stories : stories.slice(0, 10);

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(255,102,0,0.1)" }}>
            <svg className="h-4 w-4" style={{ color: "#FF6600" }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 0v24h24V0H0zm12.8 14.4v5.1H11V14.4L6.2 4.5h2.1l3.6 7.5 3.6-7.5h2.1l-4.8 9.9z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Hacker News</h2>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>AI-related top stories</p>
          </div>
        </div>
        {stories.length > 0 && (
          <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "rgba(255,102,0,0.1)", color: "#FF6600" }}>
            {stories.length} stories
          </span>
        )}
      </div>

      {loading && <SkeletonReddit />}

      {!loading && stories.length === 0 && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center" style={{ borderColor: "var(--border)" }}>
          <svg className="mx-auto h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0v24h24V0H0zm12.8 14.4v5.1H11V14.4L6.2 4.5h2.1l3.6 7.5 3.6-7.5h2.1l-4.8 9.9z"/>
          </svg>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No stories found</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>AI-related Hacker News stories will appear here</p>
        </div>
      )}

      {!loading && stories.length > 0 && (
        <>
          <div
            className="rounded-xl border overflow-hidden divide-y"
            style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
          >
            {visible.map((story, idx) => (
              <a
                key={story.id}
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-4 py-3.5 group transition-colors hover:bg-[var(--surface-hover)] cursor-pointer no-underline"
                style={{ borderColor: "var(--border)", display: "flex" }}
              >
                {/* Rank + Score */}
                <div className="flex flex-col items-center shrink-0 w-10 pt-0.5">
                  <span className="text-[10px] font-medium mb-0.5" style={{ color: "var(--text-muted)" }}>
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <svg className="h-3 w-3" style={{ color: "#FF6600" }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {story.score}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <span
                    className="text-[13px] font-medium leading-snug group-hover:text-[#FF6600] transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {story.title}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      by {story.by}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {formatDistanceToNow(new Date(story.time * 1000), { addSuffix: true })}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                    <span
                      className="text-[11px] hover:text-[#FF6600] transition-colors"
                      style={{ color: "var(--text-tertiary)" }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(story.hnUrl, "_blank");
                      }}
                    >
                      {story.descendants} comments
                    </span>
                  </div>
                </div>

                {/* Domain + arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  {story.url && !story.url.includes("ycombinator") && (
                    <span className="hidden text-[10px] sm:inline rounded-full px-2 py-0.5 font-medium" style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}>
                      {new URL(story.url).hostname.replace("www.", "")}
                    </span>
                  )}
                  <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>

          {!showAll && stories.length > 10 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 w-full rounded-lg border py-2.5 text-xs font-medium transition-all hover:bg-[var(--surface-hover)] active:scale-[0.99]"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
            >
              Show all {stories.length} stories
            </button>
          )}
        </>
      )}
    </section>
  );
}
