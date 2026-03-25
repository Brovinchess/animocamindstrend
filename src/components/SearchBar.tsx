"use client";

import { forwardRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar({ value, onChange }, ref) {
    return (
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--text-tertiary)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Search articles... (press "/" to focus)'
          className="w-full rounded-lg border py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-teal focus:ring-1 focus:ring-teal/20"
          style={{
            background: "var(--surface-card)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>
    );
  }
);
