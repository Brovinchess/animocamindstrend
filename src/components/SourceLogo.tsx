"use client";

const logos: Record<string, React.ReactNode> = {
  "google-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
  openai: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" style={{ color: "var(--text-primary)" }}>
      <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 0011.5.46a6.04 6.04 0 00-5.753 4.218 6.045 6.045 0 00-4.042 2.928 6.06 6.06 0 00.748 7.12 5.98 5.98 0 00.51 4.911 6.04 6.04 0 006.51 2.9A6.065 6.065 0 0012.5 23.54a6.04 6.04 0 005.753-4.218 6.045 6.045 0 004.042-2.928 6.06 6.06 0 00-.748-7.12zM12.5 21.426a4.476 4.476 0 01-2.876-1.04l.144-.08 4.773-2.757a.776.776 0 00.395-.676v-6.738l2.017 1.164a.071.071 0 01.039.057v5.574a4.504 4.504 0 01-4.492 4.496zM3.68 17.61a4.477 4.477 0 01-.535-3.015l.143.086 4.773 2.756a.774.774 0 00.787 0l5.83-3.366v2.327a.072.072 0 01-.029.062l-4.827 2.787a4.504 4.504 0 01-6.142-1.637zM2.452 7.96a4.476 4.476 0 012.341-1.972V11.6a.776.776 0 00.395.676l5.83 3.365-2.018 1.164a.071.071 0 01-.068.006L4.105 14.02A4.504 4.504 0 012.452 7.96zm16.973 3.95l-5.83-3.366 2.018-1.164a.071.071 0 01.068-.006l4.827 2.787a4.504 4.504 0 01-.696 8.118v-5.612a.776.776 0 00-.387-.676zm2.006-3.028l-.143-.085-4.774-2.756a.774.774 0 00-.787 0l-5.83 3.365V7.08a.072.072 0 01.029-.062l4.827-2.787a4.504 4.504 0 016.678 4.651zM9.472 13.452l-2.017-1.164a.071.071 0 01-.039-.057V6.657a4.504 4.504 0 017.367-3.456l-.143.08-4.773 2.757a.776.776 0 00-.395.676zm1.095-2.36L12.5 9.86l1.933 1.116v2.232L12.5 14.324l-1.933-1.116z"/>
    </svg>
  ),
  "microsoft-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  ),
  "meta-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#0081FB">
      <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a4.892 4.892 0 00.655 1.578C1.543 19.09 2.637 20 4.17 20c.967 0 1.982-.398 2.99-1.232a17.793 17.793 0 002.567-2.834c.558-.745 1.06-1.527 1.506-2.296.445.77.947 1.55 1.506 2.296a17.793 17.793 0 002.567 2.834c1.008.834 2.023 1.232 2.99 1.232 1.533 0 2.627-.91 3.305-2a4.892 4.892 0 00.655-1.578c.14-.604.21-1.267.21-1.973 0-2.566-.704-5.24-2.044-7.303C18.768 5.31 17.053 4.03 15.085 4.03c-1.476 0-2.703.739-3.578 1.59l-.508.494-.507-.494C9.618 4.769 8.39 4.03 6.915 4.03z"/>
    </svg>
  ),
  anthropic: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#D97706">
      <path d="M13.827 3.52h3.603L24 20.48h-3.603L13.827 3.52zm-7.258 0h3.604L16.742 20.48h-3.603L6.569 3.52zM0 20.48h3.604L10.173 3.52H6.569L0 20.48z"/>
    </svg>
  ),
  "nvidia-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#76B900">
      <path d="M8.948 8.798v-1.43a6.7 6.7 0 01.424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.81 3.784-5.834 3.784a4.475 4.475 0 01-1.083-.13V9.178c1.397.142 1.678.73 2.521 2.48l1.87-1.59s-1.565-1.833-3.577-1.833c-.305 0-.56.025-.814.062zm0-4.734v2.06l.424-.024c5.472-.178 9.072 4.659 9.072 4.659S14.542 16.2 10.465 16.2a6.4 6.4 0 01-1.517-.181v1.588a7.6 7.6 0 001.293.115c4.238 0 7.299-2.148 10.279-4.682.495.398 2.52 1.363 2.937 1.784-2.732 2.176-9.072 4.218-13.116 4.218-.472 0-.92-.025-1.393-.074v1.87H24V4.064H8.948zM8.948 17.607v1.57H0V7.752c0-.002 3.162-2.378 8.948-2.753v1.778c-3.397.305-6.048 2.355-6.048 2.355s2.81 4.044 6.048 4.475z"/>
    </svg>
  ),
  "apple-ml": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" style={{ color: "var(--text-primary)" }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
  "aws-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#FF9900">
      <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 01-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 01-.287-.375 6.18 6.18 0 01-.248-.471c-.622.734-1.405 1.1-2.347 1.1-.67 0-1.205-.191-1.596-.574-.392-.382-.592-.89-.592-1.525 0-.675.237-1.222.72-1.638.48-.415 1.12-.623 1.936-.623.268 0 .544.024.832.064.288.04.584.104.896.176v-.583c0-.6-.125-1.016-.375-1.253-.256-.237-.687-.352-1.3-.352-.28 0-.567.032-.863.104-.296.072-.584.16-.864.272a2.18 2.18 0 01-.264.104.491.491 0 01-.12.016c-.16 0-.24-.112-.24-.344V5.96c0-.176.016-.312.056-.392a.568.568 0 01.224-.176c.28-.144.616-.264 1.008-.36A5.1 5.1 0 015.5 4.912c.856 0 1.48.192 1.88.584.392.392.592.992.592 1.8V10.036z"/>
      <path d="M21.408 18.504C18.87 20.328 15.168 21.296 12 21.296c-4.4 0-8.368-1.624-11.368-4.328-.232-.216-.024-.504.256-.336 3.24 1.88 7.24 3.016 11.376 3.016 2.784 0 5.848-.576 8.664-1.776.424-.184.784.28.48.632z" fill="#FF9900"/>
    </svg>
  ),
  deepmind: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#4285F4">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L19.82 8.5 12 12.82 4.18 8.5 12 4.18zM3 8.95l8.5 4.26v8.34L3 17.29V8.95zm10.5 12.6v-8.34l8.5-4.26v8.34l-8.5 4.26z"/>
    </svg>
  ),
  "hugging-face": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#FFD21E">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 1.5a8.5 8.5 0 110 17 8.5 8.5 0 010-17z"/>
      <circle cx="8.5" cy="11" r="1.5" fill="#FF9D00"/>
      <circle cx="15.5" cy="11" r="1.5" fill="#FF9D00"/>
      <path d="M7.5 14.5c0 2.485 2.015 4 4.5 4s4.5-1.515 4.5-4H7.5z" fill="#F09EAA"/>
    </svg>
  ),
  "mistral-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <rect x="1" y="3" width="4" height="4" fill="#F7D046"/>
      <rect x="7" y="3" width="4" height="4" fill="#F2A73B"/>
      <rect x="19" y="3" width="4" height="4" fill="#000"/>
      <rect x="1" y="9" width="4" height="4" fill="#F7D046"/>
      <rect x="7" y="9" width="4" height="4" fill="#F2A73B"/>
      <rect x="13" y="9" width="4" height="4" fill="#EF6537"/>
      <rect x="19" y="9" width="4" height="4" fill="#000"/>
      <rect x="1" y="15" width="4" height="4" fill="#000"/>
      <rect x="7" y="15" width="4" height="4" fill="#000"/>
      <rect x="13" y="15" width="4" height="4" fill="#000"/>
      <rect x="19" y="15" width="4" height="4" fill="#000"/>
    </svg>
  ),
  perplexity: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#20B8CD">
      <path d="M12 1L4 5v6l8 4 8-4V5l-8-4zm0 2.2L18 7v3.8l-6 3-6-3V7l6-3.8zM4 13v6l8 4 8-4v-6l-8 4-8-4z"/>
    </svg>
  ),
  cohere: (
    <svg viewBox="0 0 24 24" className="h-full w-full">
      <circle cx="12" cy="12" r="10" fill="#39594D"/>
      <circle cx="12" cy="12" r="4" fill="#D18EE2"/>
      <circle cx="7" cy="8" r="2.5" fill="#FF7759"/>
      <circle cx="17" cy="8" r="2.5" fill="#6E8FF2"/>
    </svg>
  ),
  "stability-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#7C3AED">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  replicate: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" style={{ color: "var(--text-primary)" }}>
      <path d="M4 4h16v3H4V4zm0 6.5h16v3H4v-3zM4 17h16v3H4v-3z"/>
    </svg>
  ),
  "together-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#0066FF">
      <circle cx="8" cy="8" r="3"/>
      <circle cx="16" cy="8" r="3"/>
      <circle cx="8" cy="16" r="3"/>
      <circle cx="16" cy="16" r="3"/>
      <line x1="8" y1="8" x2="16" y2="8" stroke="#0066FF" strokeWidth="1.5"/>
      <line x1="8" y1="8" x2="8" y2="16" stroke="#0066FF" strokeWidth="1.5"/>
      <line x1="16" y1="8" x2="16" y2="16" stroke="#0066FF" strokeWidth="1.5"/>
      <line x1="8" y1="16" x2="16" y2="16" stroke="#0066FF" strokeWidth="1.5"/>
      <line x1="8" y1="8" x2="16" y2="16" stroke="#0066FF" strokeWidth="1.5"/>
    </svg>
  ),
  xai: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" style={{ color: "var(--text-primary)" }}>
      <path d="M3 3l7.5 9L3 21h2l6.5-7.8L18 21h3l-7.8-9.4L21 3h-2l-6.2 7.4L6 3H3z"/>
    </svg>
  ),
  "verge-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#E2127A">
      <path d="M12 2L2 22h5l5-10 5 10h5L12 2z"/>
    </svg>
  ),
  "techcrunch-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#0A9B00">
      <path d="M4 4h16v4H14v12h-4V8H4V4z"/>
    </svg>
  ),
  "arstechnica-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#FF6600">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">A</text>
    </svg>
  ),
  "mit-tech-review": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#9B1C2E">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">MIT</text>
    </svg>
  ),
  // Web3 / Crypto sources
  coindesk: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#0A3F8F">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">CD</text>
    </svg>
  ),
  "the-block": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#000000">
      <rect x="2" y="2" width="20" height="20" rx="4"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">TB</text>
    </svg>
  ),
  decrypt: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#2C6FBB">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 8l8 4-8 4V8z" fill="white"/>
    </svg>
  ),
  "decrypt-gaming": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#7C3AED">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 8l8 4-8 4V8z" fill="white"/>
    </svg>
  ),
  cointelegraph: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#1A1A2E">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" textAnchor="middle" fill="#F5A623" fontSize="11" fontWeight="bold">CT</text>
    </svg>
  ),
  blockworks: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#6366F1">
      <rect x="2" y="2" width="20" height="20" rx="4"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">BW</text>
    </svg>
  ),
  defillama: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#4A5568">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">DL</text>
    </svg>
  ),
  // Finance sources
  "cnbc-finance": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#005594">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">CNBC</text>
    </svg>
  ),
  "cnbc-tech": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#005594">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">CNBC</text>
    </svg>
  ),
  marketwatch: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#1A8A1A">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">MW</text>
    </svg>
  ),
  "seeking-alpha": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#F58220">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">SA</text>
    </svg>
  ),
  "rundown-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#6D28D9">
      <rect x="2" y="2" width="20" height="20" rx="4"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">RD</text>
    </svg>
  ),
  // Additional AI sources
  "venturebeat-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#C33E22">
      <path d="M2 4h5l5 12 5-12h5L14 22h-4L2 4z"/>
    </svg>
  ),
  "wired-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor" style={{ color: "var(--text-primary)" }}>
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <text x="12" y="15.5" textAnchor="middle" fill="var(--surface)" fontSize="7" fontWeight="900">WIRED</text>
    </svg>
  ),
  // New Web3 sources
  chainalysis: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#1652F0">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12a4 4 0 018 0" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M8 12a4 4 0 000 0" stroke="white" strokeWidth="2" fill="none" strokeDasharray="2 2"/>
    </svg>
  ),
  kraken: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#5741D9">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">K</text>
    </svg>
  ),
  messari: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#2563EB">
      <rect x="2" y="2" width="20" height="20" rx="4"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">M</text>
    </svg>
  ),
  dappradar: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#5C6AFF">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">DR</text>
    </svg>
  ),
  "a16z-crypto": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#000000">
      <rect x="2" y="2" width="20" height="20" rx="4"/>
      <text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">a16z</text>
    </svg>
  ),
  // New Finance sources
  "wsj-business": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#0274B6">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">WSJ</text>
    </svg>
  ),
  "wsj-markets": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#0274B6">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <text x="12" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">WSJ</text>
    </svg>
  ),
  fortune: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#E42527">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="900">F</text>
    </svg>
  ),
  "motley-fool": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#5256A6">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">MF</text>
    </svg>
  ),
  // New AI sources
  "ieee-spectrum": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#00629B">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <text x="12" y="15" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">IEEE</text>
    </svg>
  ),
  "infoq-ai": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#007BFF">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">iQ</text>
    </svg>
  ),
  // New Web3 sources
  "the-defiant": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#8B5CF6">
      <rect x="2" y="2" width="20" height="20" rx="4"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">TD</text>
    </svg>
  ),
  "ethereum-blog": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#627EEA">
      <path d="M12 2l-7 11.5 7 4.2 7-4.2L12 2zm-7 13l7 7 7-7-7 4.2L5 15z"/>
    </svg>
  ),
  "bitcoin-magazine": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#F7931A">
      <circle cx="12" cy="12" r="10"/>
      <text x="12" y="17" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">B</text>
    </svg>
  ),
  // New Finance sources
  "yahoo-finance": (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#6001D2">
      <rect x="2" y="2" width="20" height="20" rx="4"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Y!</text>
    </svg>
  ),
  kiplinger: (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="#003366">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">K</text>
    </svg>
  ),
};

export function SourceLogo({
  slug,
  size = "md",
}: {
  slug: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const logo = logos[slug];

  if (!logo) {
    return (
      <div
        className={`${sizeClasses[size]} rounded bg-zinc-200 flex items-center justify-center text-[8px] font-bold text-zinc-500`}
      >
        ?
      </div>
    );
  }

  return <div className={`${sizeClasses[size]} flex-shrink-0`}>{logo}</div>;
}
