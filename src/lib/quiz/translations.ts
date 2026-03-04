import type { TranslationProfile } from "@/lib/quiz/questions";

export interface TranslationProfileEntry {
  id: string;
  name: string;
  profile: TranslationProfile;
}

const defaults: TranslationProfile = {
  readability: 5,
  formality: 5,
  archaic: 1,
  theological_tradition: "neutral",
  textual_basis: "eclectic",
  study_features: 5,
};

function def(partial: Partial<TranslationProfile>): TranslationProfile {
  return { ...defaults, ...partial };
}

// IDs prefixed with "bolls:" use the Bolls.life API; others use bible.helloao.org
export const translationProfiles: TranslationProfileEntry[] = [
  // --- Popular modern translations (Bolls.life) ---
  {
    id: "bolls:NIV",
    name: "New International Version",
    profile: def({ archaic: 1, formality: 5, readability: 8, theological_tradition: "evangelical", textual_basis: "critical", study_features: 5 }),
  },
  {
    id: "bolls:ESV",
    name: "English Standard Version",
    profile: def({ archaic: 2, formality: 7, readability: 6, theological_tradition: "evangelical", textual_basis: "critical", study_features: 7 }),
  },
  {
    id: "bolls:NLT",
    name: "New Living Translation",
    profile: def({ archaic: 1, formality: 3, readability: 9, theological_tradition: "evangelical", textual_basis: "critical", study_features: 3 }),
  },
  {
    id: "bolls:NASB",
    name: "New American Standard Bible",
    profile: def({ archaic: 2, formality: 8, readability: 4, theological_tradition: "evangelical", textual_basis: "critical", study_features: 8 }),
  },
  {
    id: "bolls:NKJV",
    name: "New King James Version",
    profile: def({ archaic: 4, formality: 7, readability: 6, textual_basis: "majority", theological_tradition: "evangelical", study_features: 5 }),
  },
  {
    id: "bolls:NRSVCE",
    name: "New Revised Standard Version (Catholic)",
    profile: def({ archaic: 1, formality: 6, readability: 7, theological_tradition: "mainline", textual_basis: "critical", study_features: 6 }),
  },
  {
    id: "bolls:CSB",
    name: "Christian Standard Bible",
    profile: def({ archaic: 1, formality: 5, readability: 8, theological_tradition: "evangelical", textual_basis: "critical", study_features: 5 }),
  },
  {
    id: "bolls:MSG",
    name: "The Message",
    profile: def({ archaic: 1, formality: 1, readability: 10, theological_tradition: "neutral", study_features: 1 }),
  },
  {
    id: "bolls:AMP",
    name: "Amplified Bible",
    profile: def({ archaic: 2, formality: 6, readability: 5, theological_tradition: "evangelical", textual_basis: "critical", study_features: 9 }),
  },
  // --- Free/public domain translations (bible.helloao.org) ---
  {
    id: "BSB",
    name: "Berean Standard Bible",
    profile: def({ archaic: 1, formality: 5, readability: 8, theological_tradition: "neutral", textual_basis: "critical", study_features: 5 }),
  },
  {
    id: "eng_kjv",
    name: "King James Version",
    profile: def({ archaic: 9, formality: 9, readability: 3, textual_basis: "majority", theological_tradition: "evangelical", study_features: 4 }),
  },
  {
    id: "eng_asv",
    name: "American Standard Version",
    profile: def({ archaic: 5, formality: 8, readability: 3, theological_tradition: "neutral", textual_basis: "critical", study_features: 6 }),
  },
  {
    id: "eng_web",
    name: "World English Bible",
    profile: def({ archaic: 1, formality: 4, readability: 7, theological_tradition: "neutral", textual_basis: "majority", study_features: 3 }),
  },
  {
    id: "eng_bbe",
    name: "Bible in Basic English",
    profile: def({ archaic: 1, formality: 3, readability: 10, theological_tradition: "neutral", textual_basis: "critical", study_features: 2 }),
  },
  {
    id: "eng_dby",
    name: "Darby Translation",
    profile: def({ archaic: 6, formality: 8, readability: 3, theological_tradition: "evangelical", textual_basis: "critical", study_features: 7 }),
  },
  {
    id: "eng_dra",
    name: "Douay-Rheims American",
    profile: def({ archaic: 8, formality: 8, readability: 3, theological_tradition: "catholic", textual_basis: "majority", study_features: 4 }),
  },
  {
    id: "eng_ylt",
    name: "Young's Literal Translation",
    profile: def({ archaic: 7, formality: 8, readability: 2, theological_tradition: "neutral", textual_basis: "majority", study_features: 7 }),
  },
  {
    id: "eng_lsv",
    name: "Literal Standard Version",
    profile: def({ archaic: 2, formality: 7, readability: 4, theological_tradition: "neutral", textual_basis: "critical", study_features: 8 }),
  },
  {
    id: "eng_net",
    name: "New English Translation",
    profile: def({ archaic: 1, formality: 5, readability: 7, theological_tradition: "academic", textual_basis: "critical", study_features: 9 }),
  },
  {
    id: "eng_fbv",
    name: "Free Bible Version",
    profile: def({ archaic: 1, formality: 3, readability: 9, theological_tradition: "neutral", textual_basis: "critical", study_features: 3 }),
  },
];
