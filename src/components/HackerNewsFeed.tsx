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

    const interval = setInterval(load, 30 * 60 * 1000); // 30 min
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

      {loading && <SkeletonReddit />}

      {!loading && stories.length > 0 && (
        <>
          <div
            className="rounded-xl border overflow-hidden divide-y"
            style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
          >
            {visible.map((story) => (
              <div
                key={story.id}
                className="flex items-start gap-3 px-4 py-3 group transition-colors hover:bg-[var(--surface-hover)]"
                style={{ borderColor: "var(--border)" }}
              >
                {/* Score */}
                <div className="flex flex-col items-center shrink-0 w-10 pt-0.5">
                  <svg className="h-3 w-3" style={{ color: "#FF6600" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                    {story.score}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium leading-snug hover:text-[#FF6600] transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {story.title}
                  </a>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      by {story.by}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                    <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {formatDistanceToNow(new Date(story.time * 1000), { addSuffix: true })}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                    <a
                      href={story.hnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] hover:text-[#FF6600] transition-colors"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {story.descendants} comments
                    </a>
                  </div>
                </div>

                {/* Domain */}
                {story.url && !story.url.includes("ycombinator") && (
                  <span className="hidden shrink-0 text-[10px] sm:inline rounded-full px-2 py-0.5" style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}>
                    {new URL(story.url).hostname.replace("www.", "")}
                  </span>
                )}
              </div>
            ))}
          </div>

          {!showAll && stories.length > 10 && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-3 w-full rounded-lg py-2 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Show all {stories.length} stories
            </button>
          )}
        </>
      )}
    </section>
  );
}
