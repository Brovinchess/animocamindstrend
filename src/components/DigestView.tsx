"use client";

import { useState, useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import type { NewsItem } from "@/lib/fetch-news";
import { SourceLogo } from "./SourceLogo";
import { getTagById } from "@/lib/topic-tags";

interface DigestViewProps {
  items: NewsItem[];
  onSelect: (item: NewsItem) => void;
  isBookmarked: (id: string) => boolean;
  isRead: (id: string) => boolean;
  onToggleBookmark: (id: string) => void;
}

function getDayKey(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return format(d, "yyyy-MM-dd");
  } catch {
    return "unknown";
  }
}

function getDayLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "EEEE, MMMM d");
  } catch {
    return dateStr;
  }
}

export function DigestView({
  items,
  onSelect,
  isBookmarked,
  isRead,
  onToggleBookmark,
}: DigestViewProps) {
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const groups: Record<string, NewsItem[]> = {};
    for (const item of items) {
      const key = getDayKey(item.pubDate);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    // Sort days newest first
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [items]);

  const toggleDay = (key: string) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {grouped.map(([dayKey, dayItems]) => {
        const collapsed = collapsedDays.has(dayKey);
        const label = getDayLabel(dayItems[0].pubDate);

        return (
          <section key={dayKey} className="animate-fade-in-up">
            {/* Day header */}
            <button
              onClick={() => toggleDay(dayKey)}
              className="flex w-full items-center gap-3 mb-3 group"
            >
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {label}
              </h3>
              <span className="text-xs rounded-full px-2 py-0.5" style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}>
                {dayItems.length} {dayItems.length === 1 ? "article" : "articles"}
              </span>
              <div className="flex-1 border-b" style={{ borderColor: "var(--border)" }} />
              <svg
                className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`}
                style={{ color: "var(--text-muted)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Articles */}
            {!collapsed && (
              <div
                className="rounded-xl border overflow-hidden divide-y"
                style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
              >
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`group flex items-start gap-3 cursor-pointer px-4 py-3 transition-colors hover:bg-[var(--surface-hover)] ${
                      isRead(item.id) ? "opacity-50" : ""
                    }`}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <SourceLogo slug={item.source.slug} size="md" />
                    <div className="min-w-0 flex-1">
                      <h4
                        className="text-[13px] font-medium leading-snug mb-1 group-hover:text-teal-dark transition-colors"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {item.source.name}
                        </span>
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          · {item.readingTime} min read
                        </span>
                        {item.tags.slice(0, 2).map((tagId) => {
                          const tag = getTagById(tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tagId}
                              className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${tag.bg} ${tag.color}`}
                            >
                              {tag.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id); }}
                      className="shrink-0 p-1 mt-0.5 transition-colors"
                      style={{ color: isBookmarked(item.id) ? "#0d9488" : "var(--text-muted)" }}
                    >
                      <svg className="h-3.5 w-3.5" fill={isBookmarked(item.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
