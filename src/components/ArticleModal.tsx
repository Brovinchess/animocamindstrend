"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { NewsItem } from "@/lib/fetch-news";
import { formatDistanceToNow, format } from "date-fns";
import { SourceLogo } from "./SourceLogo";
import { getTagById } from "@/lib/topic-tags";

interface ArticleModalProps {
  item: NewsItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
}

export function ArticleModal({
  item,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onShare,
}: ArticleModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "b") onToggleBookmark();
      if (e.key === "s") onShare();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [item, onClose, onToggleBookmark, onShare]);

  if (!item || !mounted) return null;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(item.pubDate), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  const dateFormatted = (() => {
    try {
      return format(new Date(item.pubDate), "MMMM d, yyyy 'at' h:mm a");
    } catch {
      return item.pubDate;
    }
  })();

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden animate-scale-in"
        style={{ background: "var(--surface-card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <SourceLogo slug={item.source.slug} size="lg" />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.source.name}</p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onShare}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: "var(--text-tertiary)" }}
              title="Copy link (S)"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button
              onClick={onToggleBookmark}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: isBookmarked ? "#0d9488" : "var(--text-tertiary)" }}
              title={isBookmarked ? "Remove bookmark (B)" : "Bookmark (B)"}
            >
              <svg className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: "var(--text-tertiary)" }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Salience badge */}
          {item.salienceScore === "HIGH" && (
            <span className="inline-block rounded-full bg-teal/10 px-2.5 py-0.5 text-[10px] font-semibold text-teal-dark mb-3">
              HIGH RELEVANCE
            </span>
          )}

          <h2 className="text-lg font-semibold leading-snug mb-4" style={{ color: "var(--text-primary)" }}>
            {item.title}
          </h2>

          <div className="mb-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-teal-dark mb-2">Summary</p>
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {item.description || "No summary available for this article."}
            </p>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {item.tags.map((tagId) => {
                const tag = getTagById(tagId);
                if (!tag) return null;
                return (
                  <span key={tagId} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tag.bg} ${tag.color}`}>
                    {tag.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Details */}
          <div className="rounded-lg p-4 space-y-2.5 mb-5" style={{ background: "var(--surface-muted)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Published</span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{dateFormatted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Reading time</span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.readingTime} min read</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Source</span>
              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{item.source.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Category</span>
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-medium border"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {item.source.category}
              </span>
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="flex items-center gap-3 text-[10px] mb-4" style={{ color: "var(--text-muted)" }}>
            <span><kbd className="rounded border px-1" style={{ borderColor: "var(--border)" }}>B</kbd> bookmark</span>
            <span><kbd className="rounded border px-1" style={{ borderColor: "var(--border)" }}>S</kbd> share</span>
            <span><kbd className="rounded border px-1" style={{ borderColor: "var(--border)" }}>Esc</kbd> close</span>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-5">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark"
          >
            Read full article
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
