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

export const translationProfiles: TranslationProfileEntry[] = [
  {
    id: "KJV",
    name: "King James Version",
    profile: def({ archaic: 9, formality: 9, readability: 3, textual_basis: "majority", theological_tradition: "evangelical", study_features: 4 }),
  },
  {
    id: "NKJV",
    name: "New King James Version",
    profile: def({ archaic: 4, formality: 7, readability: 6, textual_basis: "majority", theological_tradition: "evangelical", study_features: 5 }),
  },
  {
    id: "ESV",
    name: "English Standard Version",
    profile: def({ archaic: 2, formality: 7, readability: 6, theological_tradition: "evangelical", textual_basis: "critical", study_features: 7 }),
  },
  {
    id: "NIV",
    name: "New International Version",
    profile: def({ archaic: 1, formality: 5, readability: 8, theological_tradition: "evangelical", textual_basis: "critical", study_features: 5 }),
  },
  {
    id: "NLT",
    name: "New Living Translation",
    profile: def({ archaic: 1, formality: 3, readability: 9, theological_tradition: "evangelical", textual_basis: "critical", study_features: 3 }),
  },
  {
    id: "NASB",
    name: "New American Standard Bible",
    profile: def({ archaic: 2, formality: 8, readability: 4, theological_tradition: "evangelical", textual_basis: "critical", study_features: 8 }),
  },
  {
    id: "BSB",
    name: "Berean Standard Bible",
    profile: def({ archaic: 1, formality: 5, readability: 8, theological_tradition: "neutral", textual_basis: "critical", study_features: 5 }),
  },
  {
    id: "CSB",
    name: "Christian Standard Bible",
    profile: def({ archaic: 1, formality: 5, readability: 8, theological_tradition: "evangelical", textual_basis: "critical", study_features: 5 }),
  },
  {
    id: "MSG",
    name: "The Message",
    profile: def({ archaic: 1, formality: 1, readability: 10, theological_tradition: "neutral", study_features: 1 }),
  },
  {
    id: "AMP",
    name: "Amplified Bible",
    profile: def({ archaic: 2, formality: 6, readability: 5, theological_tradition: "evangelical", textual_basis: "critical", study_features: 9 }),
  },
  {
    id: "RSV",
    name: "Revised Standard Version",
    profile: def({ archaic: 3, formality: 7, readability: 5, theological_tradition: "mainline", textual_basis: "critical", study_features: 5 }),
  },
  {
    id: "NRSV",
    name: "New Revised Standard Version",
    profile: def({ archaic: 1, formality: 6, readability: 7, theological_tradition: "mainline", textual_basis: "critical", study_features: 6 }),
  },
  {
    id: "NAB",
    name: "New American Bible",
    profile: def({ archaic: 1, formality: 5, readability: 7, theological_tradition: "catholic", textual_basis: "critical", study_features: 6 }),
  },
  {
    id: "DRA",
    name: "Douay-Rheims American",
    profile: def({ archaic: 8, formality: 8, readability: 3, theological_tradition: "catholic", textual_basis: "majority", study_features: 4 }),
  },
  {
    id: "WEB",
    name: "World English Bible",
    profile: def({ archaic: 1, formality: 4, readability: 7, theological_tradition: "neutral", textual_basis: "majority", study_features: 3 }),
  },
  {
    id: "YLT",
    name: "Young's Literal Translation",
    profile: def({ archaic: 7, formality: 8, readability: 2, theological_tradition: "neutral", textual_basis: "majority", study_features: 7 }),
  },
  {
    id: "ASV",
    name: "American Standard Version",
    profile: def({ archaic: 5, formality: 8, readability: 3, theological_tradition: "neutral", textual_basis: "critical", study_features: 6 }),
  },
  {
    id: "NET",
    name: "New English Translation",
    profile: def({ archaic: 1, formality: 5, readability: 7, theological_tradition: "academic", textual_basis: "critical", study_features: 9 }),
  },
];
