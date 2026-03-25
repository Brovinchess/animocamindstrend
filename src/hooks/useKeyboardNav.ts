"use client";

import { useState, useEffect, useCallback } from "react";

interface UseKeyboardNavOptions {
  itemCount: number;
  onSelect: (index: number) => void;
  onBookmark?: (index: number) => void;
  onShare?: (index: number) => void;
  searchRef?: React.RefObject<HTMLInputElement | null>;
  enabled?: boolean;
}

export function useKeyboardNav({
  itemCount,
  onSelect,
  onBookmark,
  onShare,
  searchRef,
  enabled = true,
}: UseKeyboardNavOptions) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // "/" focuses search from anywhere
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        searchRef?.current?.focus();
        setFocusedIndex(-1);
        return;
      }

      // Don't handle other keys when in an input
      if (isInput) return;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, itemCount - 1));
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          if (focusedIndex >= 0) {
            e.preventDefault();
            onSelect(focusedIndex);
          }
          break;
        case "b":
          if (focusedIndex >= 0 && onBookmark) {
            e.preventDefault();
            onBookmark(focusedIndex);
          }
          break;
        case "s":
          if (focusedIndex >= 0 && onShare) {
            e.preventDefault();
            onShare(focusedIndex);
          }
          break;
        case "Escape":
          setFocusedIndex(-1);
          break;
      }
    },
    [enabled, itemCount, focusedIndex, onSelect, onBookmark, onShare, searchRef]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset focus when item count changes (e.g., filtering)
  useEffect(() => {
    setFocusedIndex(-1);
  }, [itemCount]);

  return { focusedIndex, setFocusedIndex };
}
