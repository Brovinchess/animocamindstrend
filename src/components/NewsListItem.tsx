"use client";

import type { NewsItem } from "@/lib/fetch-news";
import { formatDistanceToNow } from "date-fns";
import { SourceLogo } from "./SourceLogo";
import { quickTweetFromHeadline } from "@/lib/tweet-drafter";

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

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(quickTweetFromHeadline(item.title, item.link))}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-black"
        style={{ color: "var(--text-muted)" }}
        title="Tweet this"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
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
