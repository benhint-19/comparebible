// ---------------------------------------------------------------------------
// AI Perspectives type definitions
// ---------------------------------------------------------------------------

export interface Persona {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // tailwind color class
  description: string;
  systemPrompt: string;
}

export interface PerspectiveRequest {
  persona: string;
  passage: string; // e.g. "Genesis 1:1-5"
  verseText: string;
}

export interface PerspectiveResponse {
  persona: string;
  passage: string;
  content: string;
}
