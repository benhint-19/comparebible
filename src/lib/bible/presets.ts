// ---------------------------------------------------------------------------
// Curated preset groupings for parallel translations
// ---------------------------------------------------------------------------

export interface TranslationExplanation {
  id: string;
  why: string;
}

export interface TranslationPreset {
  id: string;
  name: string;
  description: string;
  translationIds: string[];
  explanations: TranslationExplanation[];
}

export const translationPresets: TranslationPreset[] = [
  {
    id: "high-contrast",
    name: "High Contrast",
    description:
      "Translations that differ the most from each other - archaic vs. modern, literal vs. paraphrase.",
    translationIds: ["eng_kjv", "bolls:ESV", "bolls:MSG", "eng_ylt"],
    explanations: [
      { id: "eng_kjv", why: "The classic 1611 translation - formal, poetic, archaic English that shaped centuries of worship." },
      { id: "bolls:ESV", why: "A modern word-for-word translation - precise and literary, widely used in Reformed churches." },
      { id: "bolls:MSG", why: "Eugene Peterson's radical paraphrase - renders the Bible in casual, contemporary American English." },
      { id: "eng_ylt", why: "Young's Literal Translation - hyper-literal, preserving the original word order and tenses at the cost of readability." },
    ],
  },
  {
    id: "word-for-word",
    name: "Word-for-Word",
    description:
      "Formal-equivalence translations that stay as close to the original languages as possible.",
    translationIds: ["bolls:NASB", "bolls:ESV", "eng_kjv", "eng_asv", "eng_lsv"],
    explanations: [
      { id: "bolls:NASB", why: "Often considered the most literally accurate modern English translation, favored for detailed study." },
      { id: "bolls:ESV", why: "Balances literal accuracy with readability - a go-to for serious Bible study in modern English." },
      { id: "eng_kjv", why: "The foundational English translation - literal for its era, with enduring influence on English literature." },
      { id: "eng_asv", why: "The 1901 American Standard Version - extremely literal, a precursor to the NASB." },
      { id: "eng_lsv", why: "Literal Standard Version - aims to be the most literal modern translation, preserving even the divine name." },
    ],
  },
  {
    id: "thought-for-thought",
    name: "Thought-for-Thought",
    description:
      "Dynamic-equivalence translations that prioritize conveying the meaning naturally.",
    translationIds: ["bolls:NIV", "bolls:NLT", "bolls:MSG", "bolls:CSB"],
    explanations: [
      { id: "bolls:NIV", why: "The world's best-selling modern translation - balances accuracy and readability for a broad audience." },
      { id: "bolls:NLT", why: "Translated from the original languages into clear, natural English - ideal for first-time readers." },
      { id: "bolls:MSG", why: "A bold paraphrase that reads like a letter from a friend - captures tone and emotion over literal wording." },
      { id: "bolls:CSB", why: "Christian Standard Bible - a newer translation aiming for the sweet spot between literal and dynamic." },
    ],
  },
  {
    id: "protestant-classics",
    name: "Protestant Classics",
    description:
      "The most widely-used translations in Protestant churches today.",
    translationIds: ["eng_kjv", "bolls:NIV", "bolls:ESV", "bolls:NASB"],
    explanations: [
      { id: "eng_kjv", why: "The King James Version - 400+ years old, still the most-quoted Bible in English-speaking Protestantism." },
      { id: "bolls:NIV", why: "The default pew Bible in many evangelical churches - trusted for both public reading and personal study." },
      { id: "bolls:ESV", why: "Increasingly popular in Reformed and evangelical circles - valued for literary quality and precision." },
      { id: "bolls:NASB", why: "Preferred by pastors and seminary students for its strict adherence to the original text." },
    ],
  },
  {
    id: "catholic-orthodox",
    name: "Catholic & Orthodox",
    description:
      "Translations that include the deuterocanonical books or come from Catholic/Orthodox tradition.",
    translationIds: ["bolls:NRSVCE", "eng_dra", "bolls:ESV", "bolls:AMP"],
    explanations: [
      { id: "bolls:NRSVCE", why: "The NRSV Catholic Edition - approved for liturgical use, includes deuterocanonical/apocryphal books." },
      { id: "eng_dra", why: "The Douay-Rheims - the historic English Catholic Bible, translated from the Latin Vulgate (1582-1610)." },
      { id: "bolls:ESV", why: "Though Protestant in origin, the ESV's literal approach makes it useful for cross-tradition comparison." },
      { id: "bolls:AMP", why: "The Amplified Bible - expands key words with brackets to show the range of meaning in the original text." },
    ],
  },
  {
    id: "modern-readable",
    name: "Modern Readable",
    description:
      "Easy-to-read modern translations - great for devotional reading or newcomers.",
    translationIds: ["bolls:NLT", "bolls:NIV", "bolls:CSB", "bolls:MSG", "eng_fbv"],
    explanations: [
      { id: "bolls:NLT", why: "Written at a roughly 6th-grade reading level - scholarly but accessible, great for reading cover to cover." },
      { id: "bolls:NIV", why: "Clear and familiar - the translation most people encounter first in modern churches." },
      { id: "bolls:CSB", why: "A fresh 2017 translation that reads smoothly while staying faithful to the original languages." },
      { id: "bolls:MSG", why: "Feels like reading a novel - strips away 'Bible-speak' to make ancient texts feel immediate." },
      { id: "eng_fbv", why: "Free Bible Version - a recent public-domain translation using simple, contemporary English." },
    ],
  },
];
