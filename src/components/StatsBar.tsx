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
  const highCount = items.filter((i) => i.salienceScore === "HIGH").length;

  const updatedAgo = lastUpdated
    ? formatDistanceToNow(lastUpdated, { addSuffix: true })
    : null;

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
      <div className="flex items-center gap-4 flex-wrap">
        <Stat value={items.length} label="articles" icon={
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        } />
        <div className="h-4 w-px" style={{ background: "var(--border)" }} />
        <Stat value={sources.size} label="sources" icon={
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        } />
        <div className="h-4 w-px" style={{ background: "var(--border)" }} />
        <Stat value={todayCount} label="today" icon={
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
        {highCount > 0 && (
          <>
            <div className="h-4 w-px" style={{ background: "var(--border)" }} />
            <Stat value={highCount} label="trending" accent icon={
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            } />
          </>
        )}
        {unreadCount > 0 && (
          <>
            <div className="h-4 w-px" style={{ background: "var(--border)" }} />
            <Stat value={unreadCount} label="unread" accent icon={
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            } />
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {updatedAgo && (
            <span className="text-[11px] hidden sm:inline" style={{ color: "var(--text-muted)" }}>
              {updatedAgo}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:bg-[var(--surface-hover)] active:scale-[0.97] disabled:opacity-50"
            style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
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
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal"></span>
            </span>
            <span className="text-[11px] font-medium" style={{ color: "#14b8a6" }}>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, accent, icon }: { value: number; label: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <span style={{ color: accent ? "#14b8a6" : "var(--text-muted)" }}>{icon}</span>
      )}
      <div className="flex items-baseline gap-1">
        <span
          className="text-base font-bold tabular-nums"
          style={{ color: accent ? "#0d9488" : "var(--text-primary)" }}
        >
          {value}
        </span>
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{label}</span>
      </div>
    </div>
  );
}
