export type GoogleModel = {
  id: string;
  label: string;
  description: string;
  available: boolean;
  badge?: string;
};

export const DEFAULT_GOOGLE_MODEL = "gemini-3.6-flash";

export const GOOGLE_MODELS: GoogleModel[] = [
  {
    id: "gemini-3.6-flash",
    label: "3.6 Flash",
    description: "All-around help",
    available: true,
    badge: "New",
  },
  {
    id: "gemini-3.5-flash",
    label: "3.5 Flash",
    description: "Fast, capable answers",
    available: false,
  },
  {
    id: "gemini-3.5-flash-lite",
    label: "3.5 Flash-Lite",
    description: "Fast fallback answers",
    available: true,
    badge: "Fallback",
  },
  {
    id: "gemini-3.1-flash",
    label: "3.1 Flash",
    description: "Balanced everyday chat",
    available: false,
  },
  {
    id: "gemini-3.6-pro",
    label: "3.6 Pro",
    description: "Advanced reasoning",
    available: false,
  },
];

export function isGoogleModel(value: unknown): value is string {
  return typeof value === "string" && GOOGLE_MODELS.some((model) => model.id === value && model.available);
}
