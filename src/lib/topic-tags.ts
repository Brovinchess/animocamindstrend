export interface TagDefinition {
  id: string;
  label: string;
  color: string; // tailwind text color
  bg: string; // tailwind bg color
  keywords: string[];
}

export const TOPIC_TAGS: TagDefinition[] = [
  {
    id: "llm",
    label: "LLM",
    color: "text-blue-700",
    bg: "bg-blue-50",
    keywords: ["llm", "language model", "gpt", "claude", "gemini", "llama", "mistral", "chatgpt", "chatbot", "generative ai", "foundation model", "large language"],
  },
  {
    id: "agents",
    label: "Agents",
    color: "text-purple-700",
    bg: "bg-purple-50",
    keywords: ["agent", "agentic", "autonomous", "tool use", "function calling", "multi-agent", "orchestrat"],
  },
  {
    id: "safety",
    label: "Safety",
    color: "text-red-700",
    bg: "bg-red-50",
    keywords: ["safety", "alignment", "guardrail", "responsible ai", "ethical", "bias", "fairness", "red team", "jailbreak", "harmful", "trust"],
  },
  {
    id: "regulation",
    label: "Regulation",
    color: "text-amber-700",
    bg: "bg-amber-50",
    keywords: ["regulation", "policy", "legislation", "governance", "compliance", "eu ai act", "executive order", "antitrust", "copyright", "lawsuit"],
  },
  {
    id: "funding",
    label: "Funding",
    color: "text-green-700",
    bg: "bg-green-50",
    keywords: ["funding", "investment", "valuation", "billion", "million", "raise", "series", "ipo", "acquisition", "acquire", "venture", "capital"],
  },
  {
    id: "open-source",
    label: "Open Source",
    color: "text-orange-700",
    bg: "bg-orange-50",
    keywords: ["open source", "open-source", "opensource", "hugging face", "weights", "apache", "mit license", "community", "fine-tun"],
  },
  {
    id: "vision",
    label: "Vision",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    keywords: ["vision", "image", "visual", "video", "diffusion", "sora", "dall-e", "midjourney", "stable diffusion", "generation", "recognition", "object detect", "computer vision"],
  },
  {
    id: "code",
    label: "Code",
    color: "text-zinc-700",
    bg: "bg-zinc-100",
    keywords: ["code", "coding", "programming", "developer", "copilot", "codex", "cursor", "ide", "software engineer", "devtool"],
  },
  {
    id: "multimodal",
    label: "Multimodal",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    keywords: ["multimodal", "multi-modal", "text-to", "speech", "audio", "voice", "tts", "transcri"],
  },
  {
    id: "robotics",
    label: "Robotics",
    color: "text-teal-700",
    bg: "bg-teal-50",
    keywords: ["robot", "robotic", "humanoid", "embodied", "physical ai", "manipulation", "autonomous vehicle", "self-driving"],
  },
  {
    id: "research",
    label: "Research",
    color: "text-violet-700",
    bg: "bg-violet-50",
    keywords: ["research", "paper", "arxiv", "benchmark", "evaluation", "study", "findings", "novel", "state-of-the-art", "breakthrough"],
  },
  {
    id: "hardware",
    label: "Hardware",
    color: "text-lime-700",
    bg: "bg-lime-50",
    keywords: ["gpu", "chip", "tpu", "nvidia", "h100", "b200", "semiconductor", "inference hardware", "data center", "compute"],
  },
  {
    id: "enterprise",
    label: "Enterprise",
    color: "text-sky-700",
    bg: "bg-sky-50",
    keywords: ["enterprise", "business", "deploy", "production", "api", "platform", "saas", "customer", "workflow", "automat"],
  },
  {
    id: "product",
    label: "Product",
    color: "text-pink-700",
    bg: "bg-pink-50",
    keywords: ["launch", "release", "introducing", "announce", "available", "update", "new feature", "preview", "beta", "rollout"],
  },
];

export function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const matched: string[] = [];

  for (const tag of TOPIC_TAGS) {
    for (const keyword of tag.keywords) {
      if (text.includes(keyword)) {
        matched.push(tag.id);
        break; // One match per tag is enough
      }
    }
  }

  return matched;
}

export function getTagById(id: string): TagDefinition | undefined {
  return TOPIC_TAGS.find((t) => t.id === id);
}
