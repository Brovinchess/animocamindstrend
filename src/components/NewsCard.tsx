"use client";

import type { NewsItem } from "@/lib/fetch-news";
import { formatDistanceToNow } from "date-fns";
import { SourceLogo } from "./SourceLogo";
import { getTagById } from "@/lib/topic-tags";

interface NewsCardProps {
  item: NewsItem;
  onClick: () => void;
  isBookmarked: boolean;
  isRead: boolean;
  isFocused: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  index: number;
}

export function NewsCard({
  item,
  onClick,
  isBookmarked,
  isRead,
  isFocused,
  onToggleBookmark,
  onShare,
  index,
}: NewsCardProps) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.pubDate), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  return (
    <article
      onClick={onClick}
      className={`group cursor-pointer rounded-xl border p-5 transition-all duration-200 animate-fade-in-up ${
        isFocused ? "ring-2 ring-teal/40 shadow-sm" : ""
      } ${isRead ? "opacity-50 hover:opacity-80" : ""}`}
      style={{
        background: "var(--surface-card)",
        borderColor: isFocused ? "var(--border-hover)" : "var(--border)",
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Source + time + actions */}
      <div className="flex items-center gap-2 mb-3">
        <SourceLogo slug={item.source.slug} size="md" />
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {item.source.name}
        </span>
        <span style={{ color: "var(--text-muted)" }}>·</span>
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {timeAgo}
        </span>
        <span style={{ color: "var(--text-muted)" }}>·</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {item.readingTime} min
        </span>

        {/* Action buttons (hover reveal) */}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="p-1 rounded transition-colors hover:bg-[var(--surface-hover)]"
            style={{ color: "var(--text-tertiary)" }}
            title="Copy link"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className="p-1 rounded transition-colors hover:bg-[var(--surface-hover)]"
            style={{ color: isBookmarked ? "#0d9488" : "var(--text-tertiary)" }}
            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <svg className="h-3.5 w-3.5" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-[15px] font-semibold leading-snug mb-2 group-hover:text-teal-dark transition-colors"
        style={{ color: "var(--text-primary)" }}
      >
        {item.title}
      </h3>

      {/* Description */}
      {item.description && (
        <p className="text-[13px] leading-relaxed line-clamp-2 mb-4" style={{ color: "var(--text-secondary)" }}>
          {item.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.tags.slice(0, 2).map((tagId) => {
            const tag = getTagById(tagId);
            if (!tag) return null;
            return (
              <span key={tagId} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tag.bg} ${tag.color}`}>
                {tag.label}
              </span>
            );
          })}
          {item.tags.length === 0 && (
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}>
              {item.source.category}
            </span>
          )}
          {item.salienceScore === "HIGH" && (
            <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal-dark">
              HOT
            </span>
          )}
          {isRead && (
            <svg className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <span
          className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity text-teal-dark"
        >
          Read more →
        </span>
      </div>
    </article>
  );
}
