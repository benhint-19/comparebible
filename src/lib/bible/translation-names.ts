import { translationProfiles } from "@/lib/quiz/translations";

const nameMap = new Map<string, string>();
for (const t of translationProfiles) {
  nameMap.set(t.id, t.name);
}

/** Returns the full translation name, or the formatted ID as fallback. */
export function getTranslationName(id: string): string {
  return nameMap.get(id) ?? formatTranslationId(id);
}

/** Strips "bolls:" / "eng_" prefixes and uppercases for display. */
export function formatTranslationId(id: string): string {
  return id.replace("bolls:", "").replace("eng_", "").toUpperCase();
}
