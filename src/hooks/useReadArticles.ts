"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useReadArticles() {
  const [readIds, setReadIds] = useLocalStorage<string[]>("readArticles", []);

  const markAsRead = useCallback(
    (id: string) => {
      setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    [setReadIds]
  );

  const isRead = useCallback(
    (id: string) => readIds.includes(id),
    [readIds]
  );

  return { readIds, markAsRead, isRead };
}
