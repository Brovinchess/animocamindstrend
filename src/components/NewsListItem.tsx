"use client";

import type { NewsItem } from "@/lib/fetch-news";
import { formatDistanceToNow } from "date-fns";
import { SourceLogo } from "./SourceLogo";

interface NewsListItemProps {
  item: NewsItem;
  onClick: () => void;
  isBookmarked: boolean;
  isRead: boolean;
  isFocused: boolean;
  onToggleBookmark: () => void;
  index: number;
}

export function NewsListItem({
  item,
  onClick,
  isBookmarked,
  isRead,
  isFocused,
  onToggleBookmark,
  index,
}: NewsListItemProps) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.pubDate), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 cursor-pointer border-b px-4 py-3 transition-all animate-fade-in-up ${
        isFocused ? "ring-2 ring-teal/40 rounded-lg" : ""
      } ${isRead ? "opacity-50" : ""}`}
      style={{
        borderColor: "var(--border)",
        animationDelay: `${index * 30}ms`,
      }}
    >
      <SourceLogo slug={item.source.slug} size="sm" />

      <h4
        className="flex-1 truncate text-[13px] font-medium group-hover:text-teal-dark transition-colors"
        style={{ color: "var(--text-primary)" }}
      >
        {item.title}
      </h4>

      <span className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline"
        style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}
      >
        {item.source.name}
      </span>

      <span className="hidden shrink-0 text-[11px] sm:inline" style={{ color: "var(--text-muted)" }}>
        {item.readingTime}m
      </span>

      <span className="shrink-0 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
        {timeAgo}
      </span>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
        className="shrink-0 p-1 transition-colors hover:text-teal-dark"
        style={{ color: isBookmarked ? "#0d9488" : "var(--text-muted)" }}
      >
        <svg className="h-3.5 w-3.5" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>
    </div>
  );
}
