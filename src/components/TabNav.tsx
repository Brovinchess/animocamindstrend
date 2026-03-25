"use client";

export type TabId = "news" | "hackernews" | "reddit" | "strategy" | "tweet";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface TabNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  redditCount?: number;
  hnCount?: number;
}

export function TabNav({ activeTab, onChange, redditCount, hnCount }: TabNavProps) {
  const tabs: Tab[] = [
    {
      id: "news",
      label: "AI News",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
        </svg>
      ),
    },
    {
      id: "hackernews",
      label: "Hacker News",
      badge: hnCount,
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 0v24h24V0H0zm12.8 14.4v5.1H11V14.4L6.2 4.5h2.1l3.6 7.5 3.6-7.5h2.1l-4.8 9.9z"/>
        </svg>
      ),
    },
    {
      id: "reddit",
      label: "Reddit",
      badge: redditCount,
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.806 1.304 3.49.997.108-.776.42-1.305.763-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
    {
      id: "tweet",
      label: "Post to X",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      id: "strategy",
      label: "Reddit Strategy",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="sticky top-0 z-30 -mx-5 px-5 sm:-mx-8 sm:px-8 py-3 mb-6 border-b backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--surface) 85%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.97] ${
              activeTab === tab.id
                ? "bg-teal/10 text-teal-dark shadow-sm"
                : "hover:bg-[var(--surface-hover)]"
            }`}
            style={activeTab !== tab.id ? { color: "var(--text-tertiary)" } : undefined}
          >
            <span className={activeTab === tab.id ? "text-teal-dark" : ""} style={activeTab !== tab.id ? { color: "var(--text-muted)" } : undefined}>
              {tab.icon}
            </span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  activeTab === tab.id ? "bg-teal/20 text-teal-dark" : ""
                }`}
                style={activeTab !== tab.id ? { background: "var(--surface-muted)", color: "var(--text-muted)" } : undefined}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
