"use client";

import { useState, useEffect } from "react";

interface MobileNavProps {
  showBookmarks: boolean;
  bookmarkCount: number;
  onToggleBookmarks: () => void;
  onFocusSearch: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export function MobileNav({
  showBookmarks,
  bookmarkCount,
  onToggleBookmarks,
  onFocusSearch,
  onToggleTheme,
  isDark,
}: MobileNavProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t py-2 md:hidden"
      style={{
        background: "var(--surface-card)",
        borderColor: "var(--border)",
      }}
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex flex-col items-center gap-0.5 p-2"
        style={{ color: "var(--text-tertiary)" }}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        <span className="text-[10px]">Home</span>
      </button>

      <button
        onClick={onFocusSearch}
        className="flex flex-col items-center gap-0.5 p-2"
        style={{ color: "var(--text-tertiary)" }}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <span className="text-[10px]">Search</span>
      </button>

      <button
        onClick={onToggleBookmarks}
        className={`relative flex flex-col items-center gap-0.5 p-2 ${showBookmarks ? "text-teal-dark" : ""}`}
        style={!showBookmarks ? { color: "var(--text-tertiary)" } : undefined}
      >
        <svg className="h-5 w-5" fill={showBookmarks ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        {bookmarkCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal text-[9px] font-bold text-white">
            {bookmarkCount}
          </span>
        )}
        <span className="text-[10px]">Saved</span>
      </button>

      <button
        onClick={onToggleTheme}
        className="flex flex-col items-center gap-0.5 p-2"
        style={{ color: "var(--text-tertiary)" }}
      >
        {mounted && isDark ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        )}
        <span className="text-[10px]">Theme</span>
      </button>
    </nav>
  );
}
