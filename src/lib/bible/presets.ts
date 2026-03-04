// ---------------------------------------------------------------------------
// Curated preset groupings for parallel translations
// ---------------------------------------------------------------------------

export interface TranslationPreset {
  id: string;
  name: string;
  description: string;
  translationIds: string[];
}

export const translationPresets: TranslationPreset[] = [
  {
    id: "high-contrast",
    name: "High Contrast",
    description:
      "Translations that differ the most from each other — archaic vs. modern, literal vs. paraphrase.",
    translationIds: ["eng_kjv", "bolls:ESV", "bolls:MSG", "eng_ylt"],
  },
  {
    id: "word-for-word",
    name: "Word-for-Word",
    description:
      "Formal-equivalence translations that stay as close to the original languages as possible.",
    translationIds: ["bolls:NASB", "bolls:ESV", "eng_kjv", "eng_asv", "eng_lsv"],
  },
  {
    id: "thought-for-thought",
    name: "Thought-for-Thought",
    description:
      "Dynamic-equivalence translations that prioritize conveying the meaning naturally.",
    translationIds: ["bolls:NIV", "bolls:NLT", "bolls:MSG", "bolls:CSB"],
  },
  {
    id: "protestant-classics",
    name: "Protestant Classics",
    description:
      "The most widely-used translations in Protestant churches today.",
    translationIds: ["eng_kjv", "bolls:NIV", "bolls:ESV", "bolls:NASB"],
  },
  {
    id: "catholic-orthodox",
    name: "Catholic & Orthodox",
    description:
      "Translations that include the deuterocanonical books or come from Catholic/Orthodox tradition.",
    translationIds: ["bolls:NRSVCE", "eng_dra", "bolls:ESV", "bolls:AMP"],
  },
  {
    id: "modern-readable",
    name: "Modern Readable",
    description:
      "Easy-to-read modern translations — great for devotional reading or newcomers.",
    translationIds: ["bolls:NLT", "bolls:NIV", "bolls:CSB", "bolls:MSG", "eng_fbv"],
  },
];
