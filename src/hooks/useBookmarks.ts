"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useLocalStorage<string[]>("bookmarks", []);

  const toggleBookmark = useCallback(
    (id: string) => {
      setBookmarkedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [setBookmarkedIds]
  );

  const isBookmarked = useCallback(
    (id: string) => bookmarkedIds.includes(id),
    [bookmarkedIds]
  );

  return { bookmarkedIds, toggleBookmark, isBookmarked, count: bookmarkedIds.length };
}
