"use client";

import { TOPIC_TAGS } from "@/lib/topic-tags";
import type { NewsItem } from "@/lib/fetch-news";

interface TagFilterProps {
  activeTags: string[];
  onToggleTag: (tagId: string) => void;
  items: NewsItem[];
}

export function TagFilter({ activeTags, onToggleTag, items }: TagFilterProps) {
  // Count articles per tag
  const tagCounts: Record<string, number> = {};
  for (const item of items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // Only show tags that have at least 1 article
  const visibleTags = TOPIC_TAGS.filter((t) => (tagCounts[t.id] || 0) > 0);

  if (visibleTags.length === 0) return null;

  return (
    <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {visibleTags.map((tag) => {
        const active = activeTags.includes(tag.id);
        const count = tagCounts[tag.id] || 0;
        return (
          <button
            key={tag.id}
            onClick={() => onToggleTag(tag.id)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
              active
                ? `${tag.bg} ${tag.color} ring-1 ring-current/20`
                : "hover:bg-[var(--surface-hover)]"
            }`}
            style={!active ? { background: "var(--surface-muted)", color: "var(--text-tertiary)" } : undefined}
          >
            {tag.label}
            <span className={`text-[10px] ${active ? "opacity-70" : "opacity-50"}`}>
              {count}
            </span>
          </button>
        );
      })}
      {activeTags.length > 0 && (
        <button
          onClick={() => activeTags.forEach(onToggleTag)}
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--surface-hover)]"
          style={{ color: "var(--text-muted)" }}
        >
          Clear tags
        </button>
      )}
    </div>
  );
}
