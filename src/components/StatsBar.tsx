"use client";

import type { NewsItem } from "@/lib/fetch-news";
import { formatDistanceToNow } from "date-fns";

interface StatsBarProps {
  items: NewsItem[];
  unreadCount: number;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function StatsBar({ items, unreadCount, lastUpdated, isRefreshing, onRefresh }: StatsBarProps) {
  const sources = new Set(items.map((i) => i.source.name));
  const todayCount = items.filter((i) => {
    const d = new Date(i.pubDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const updatedAgo = lastUpdated
    ? formatDistanceToNow(lastUpdated, { addSuffix: true })
    : null;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <Stat value={items.length} label="articles" />
      <Stat value={sources.size} label="sources" />
      <Stat value={todayCount} label="today" />
      {unreadCount > 0 && <Stat value={unreadCount} label="unread" accent />}

      <div className="ml-auto flex items-center gap-3">
        {updatedAgo && (
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Updated {updatedAgo}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
          style={{ color: "var(--text-tertiary)" }}
          title="Refresh feeds"
        >
          <svg
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal"></span>
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>live</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="text-lg font-semibold"
        style={{ color: accent ? "#0d9488" : "var(--text-primary)" }}
      >
        {value}
      </span>
      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</span>
    </div>
  );
}
