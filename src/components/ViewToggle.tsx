"use client";

export type ViewMode = "grid" | "list" | "digest";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border" style={{ borderColor: "var(--border)" }}>
      <Btn active={view === "grid"} onClick={() => onChange("grid")} title="Grid view" position="left">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </Btn>
      <Btn active={view === "list"} onClick={() => onChange("list")} title="List view" position="middle">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </Btn>
      <Btn active={view === "digest"} onClick={() => onChange("digest")} title="Digest view" position="right">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </Btn>
    </div>
  );
}

function Btn({ active, onClick, title, position, children }: {
  active: boolean;
  onClick: () => void;
  title: string;
  position: "left" | "middle" | "right";
  children: React.ReactNode;
}) {
  const rounded = position === "left" ? "rounded-l-lg" : position === "right" ? "rounded-r-lg" : "";
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center ${rounded} p-1.5 transition-colors ${
        active ? "bg-teal/10 text-teal-dark" : "hover:bg-[var(--surface-hover)]"
      }`}
      style={!active ? { color: "var(--text-tertiary)" } : undefined}
      title={title}
    >
      {children}
    </button>
  );
}
