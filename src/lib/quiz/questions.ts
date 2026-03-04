export interface TranslationProfile {
  readability: number;
  formality: number;
  archaic: number;
  theological_tradition: string;
  textual_basis: string;
  study_features: number;
}

export interface QuizOption {
  label: string;
  weights: Partial<TranslationProfile>;
  tooltip?: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  text: string;
  options: QuizOption[];
  questionTooltip?: string;
}

export const quizQuestions: QuizQuestion[] = [
  // ── Reading Style ──────────────────────────────────────────────────────
  {
    id: "archaic-comfort",
    category: "Reading Style",
    text: "How comfortable are you with old-fashioned English?",
    options: [
      { label: "Very comfortable", weights: { archaic: 9, formality: 8 } },
      { label: "Somewhat comfortable", weights: { archaic: 5, formality: 6 } },
      { label: "Prefer modern language", weights: { archaic: 2, formality: 4 } },
      { label: "Modern only", weights: { archaic: 1, formality: 2 } },
    ],
  },
  {
    id: "reading-feel",
    category: "Reading Style",
    text: "Do you prefer Bible text that reads like...",
    options: [
      { label: "A literary masterpiece", weights: { formality: 8, readability: 5, archaic: 6 } },
      { label: "Natural conversation", weights: { formality: 3, readability: 9, archaic: 1 } },
      { label: "Direct and simple", weights: { formality: 4, readability: 8, archaic: 1 } },
      { label: "Poetic and majestic", weights: { formality: 9, readability: 4, archaic: 7 } },
    ],
  },
  {
    id: "translation-philosophy",
    category: "Reading Style",
    text: "When reading, do you prefer...",
    options: [
      {
        label: "Word-for-word accuracy",
        weights: { readability: 3, formality: 8, study_features: 7 },
        tooltip: "A translation approach (called 'formal equivalence') that tries to mirror the original Hebrew/Greek word order and structure as closely as possible.",
      },
      {
        label: "Thought-for-thought clarity",
        weights: { readability: 7, formality: 5, study_features: 5 },
        tooltip: "A translation approach (called 'dynamic equivalence') that rephrases the original meaning in natural modern English, even if the word order changes.",
      },
      { label: "A balance of both", weights: { readability: 6, formality: 6, study_features: 5 } },
      { label: "Easy readability above all", weights: { readability: 10, formality: 2, study_features: 3 } },
    ],
  },
  {
    id: "gender-language",
    category: "Reading Style",
    text: "How important is gender-inclusive language?",
    questionTooltip: "Whether the translation uses terms like 'people' or 'brothers and sisters' instead of the traditional 'men' or 'brothers' when the original text refers to mixed groups.",
    options: [
      { label: "Very important", weights: { theological_tradition: "mainline", readability: 7 } },
      { label: "Somewhat important", weights: { theological_tradition: "neutral", readability: 7 } },
      { label: "Neutral", weights: { theological_tradition: "neutral" } },
      { label: "Prefer traditional gendered language", weights: { theological_tradition: "evangelical", archaic: 4 } },
    ],
  },
  {
    id: "tone-preference",
    category: "Reading Style",
    text: "Do you prefer formal or informal tone?",
    options: [
      { label: "Very formal", weights: { formality: 10, archaic: 6, readability: 3 } },
      { label: "Moderately formal", weights: { formality: 7, archaic: 3, readability: 6 } },
      { label: "Casual and approachable", weights: { formality: 3, archaic: 1, readability: 8 } },
      { label: "Very casual", weights: { formality: 1, archaic: 1, readability: 10 } },
    ],
  },
  {
    id: "paraphrase-comfort",
    category: "Reading Style",
    text: "How do you feel about paraphrased translations?",
    questionTooltip: "Very free renderings that completely rewrite passages in casual modern language, like The Message. Not a direct translation but an interpretation.",
    options: [
      { label: "Love them — easier to understand", weights: { readability: 10, formality: 1, archaic: 1 } },
      { label: "OK sometimes", weights: { readability: 7, formality: 4, archaic: 1 } },
      { label: "Prefer more literal translations", weights: { readability: 5, formality: 7, archaic: 3 } },
      { label: "Only literal translations", weights: { readability: 3, formality: 9, archaic: 5, study_features: 7 } },
    ],
  },

  // ── Theological Leaning ────────────────────────────────────────────────
  {
    id: "tradition",
    category: "Theological Leaning",
    text: "What tradition are you most interested in?",
    options: [
      { label: "Evangelical Protestant", weights: { theological_tradition: "evangelical" } },
      { label: "Mainline Protestant", weights: { theological_tradition: "mainline" } },
      { label: "Catholic", weights: { theological_tradition: "catholic" } },
      { label: "Non-denominational", weights: { theological_tradition: "neutral" } },
      { label: "Secular / academic", weights: { theological_tradition: "academic" } },
    ],
  },
  {
    id: "study-notes",
    category: "Theological Leaning",
    text: "How important are study notes and cross-references?",
    questionTooltip: "Footnotes explaining context, alternative translations, and links to related passages elsewhere in the Bible.",
    options: [
      { label: "Essential — I want deep footnotes", weights: { study_features: 10 } },
      { label: "Nice to have", weights: { study_features: 6 } },
      { label: "Don't need them", weights: { study_features: 3 } },
      { label: "Prefer clean text without notes", weights: { study_features: 1, readability: 8 } },
    ],
  },
  {
    id: "deuterocanonical",
    category: "Theological Leaning",
    text: "Do you value including the deuterocanonical / apocryphal books?",
    questionTooltip: "Additional books found in Catholic and Orthodox Bibles but not in most Protestant Bibles, such as Tobit, Wisdom, and Maccabees.",
    options: [
      { label: "Yes, essential", weights: { theological_tradition: "catholic" } },
      { label: "Would be nice", weights: { theological_tradition: "mainline" } },
      { label: "Don't care either way", weights: { theological_tradition: "neutral" } },
      { label: "No, Protestant canon only", weights: { theological_tradition: "evangelical" } },
    ],
  },
  {
    id: "textual-basis",
    category: "Theological Leaning",
    text: "What textual basis do you prefer for the New Testament?",
    questionTooltip: "Which ancient manuscript collection the translation was based on. 'Majority/Byzantine' uses later but more numerous manuscripts; 'Critical/eclectic' uses older manuscripts that scholars consider closer to the originals.",
    options: [
      {
        label: "Majority / Byzantine text (Textus Receptus)",
        weights: { textual_basis: "majority", archaic: 5 },
        tooltip: "A family of Greek manuscripts from the medieval period. More copies exist but they're newer. Used by the KJV and NKJV.",
      },
      {
        label: "Critical / eclectic text (NA/UBS)",
        weights: { textual_basis: "critical", study_features: 6 },
        tooltip: "A scholarly reconstruction using the oldest available manuscripts (like the Dead Sea Scrolls and early papyri). Used by most modern translations.",
      },
      { label: "Don't know / don't care", weights: { textual_basis: "eclectic" } },
    ],
  },
  {
    id: "theological-neutrality",
    category: "Theological Leaning",
    text: "How important is theological neutrality in translation?",
    questionTooltip: "Whether the translation avoids favoring any particular Christian denomination's doctrinal positions in how it renders disputed passages.",
    options: [
      { label: "Very important — minimize bias", weights: { theological_tradition: "academic", study_features: 7 } },
      { label: "Somewhat important", weights: { theological_tradition: "neutral", study_features: 5 } },
      { label: "Prefer aligned with my tradition", weights: {} },
      { label: "Don't care", weights: { theological_tradition: "neutral" } },
    ],
  },
  {
    id: "red-letter",
    category: "Theological Leaning",
    text: "Do you want red-letter editions (Jesus's words highlighted)?",
    questionTooltip: "Bibles that print the words spoken by Jesus in red ink to distinguish them from narrative and other speakers.",
    options: [
      { label: "Yes, definitely", weights: { theological_tradition: "evangelical" } },
      { label: "Don't care", weights: {} },
      { label: "No preference either way", weights: {} },
    ],
  },

  // ── Study Goals ────────────────────────────────────────────────────────
  {
    id: "primary-purpose",
    category: "Study Goals",
    text: "What is your primary purpose for reading the Bible?",
    options: [
      { label: "Personal devotion", weights: { readability: 7, formality: 5 } },
      { label: "Academic study", weights: { study_features: 9, formality: 7, theological_tradition: "academic" } },
      { label: "Teaching or preaching", weights: { readability: 6, formality: 6, study_features: 6 } },
      { label: "Casual curiosity", weights: { readability: 9, formality: 2, study_features: 2 } },
    ],
  },
  {
    id: "original-languages",
    category: "Study Goals",
    text: "Will you compare translations with the original Hebrew/Greek?",
    options: [
      { label: "Yes, frequently", weights: { study_features: 10, formality: 7, textual_basis: "critical" } },
      { label: "Sometimes", weights: { study_features: 7, formality: 6 } },
      { label: "Rarely", weights: { study_features: 4 } },
      { label: "Never", weights: { study_features: 2, readability: 7 } },
    ],
  },
  {
    id: "memorization",
    category: "Study Goals",
    text: "Do you want a translation suitable for memorization?",
    options: [
      { label: "Yes, very important", weights: { readability: 6, formality: 7, archaic: 3 } },
      { label: "Somewhat important", weights: { readability: 7, formality: 5 } },
      { label: "Not a priority", weights: { readability: 8 } },
      { label: "No", weights: {} },
    ],
  },
  {
    id: "key-term-consistency",
    category: "Study Goals",
    text: "How important is consistency of key term translation?",
    questionTooltip: "Whether the same Hebrew or Greek word is always translated the same way in English throughout the Bible, making it easier to trace themes.",
    options: [
      { label: "Very important", weights: { study_features: 9, formality: 7 } },
      { label: "Somewhat important", weights: { study_features: 6, formality: 5 } },
      { label: "Not important", weights: { readability: 7 } },
      { label: "Don't know what that means", weights: { readability: 8 } },
    ],
  },
  {
    id: "reading-aloud",
    category: "Study Goals",
    text: "Do you want a translation that is good for reading aloud?",
    questionTooltip: "Some translations have a more natural rhythm and flow when spoken, which matters for church readings or audiobook-style listening.",
    options: [
      { label: "Yes, very important", weights: { readability: 8, formality: 5, archaic: 2 } },
      { label: "Somewhat important", weights: { readability: 7, formality: 5 } },
      { label: "Not important", weights: {} },
    ],
  },
  {
    id: "experience-level",
    category: "Study Goals",
    text: "Are you reading the Bible for the first time or re-reading?",
    options: [
      { label: "First time", weights: { readability: 10, formality: 2, archaic: 1, study_features: 2 } },
      { label: "Mostly new to it", weights: { readability: 8, formality: 3, archaic: 1, study_features: 3 } },
      { label: "Re-reading familiar passages", weights: { readability: 6, formality: 6, study_features: 5 } },
      { label: "Deep study — very experienced", weights: { study_features: 9, formality: 7, archaic: 4 } },
    ],
  },
];
