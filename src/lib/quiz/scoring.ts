import { quizQuestions, type TranslationProfile } from "@/lib/quiz/questions";
import { translationProfiles, type TranslationProfileEntry } from "@/lib/quiz/translations";

export interface QuizResult {
  primary: string;
  parallels: string[];
  scores: { id: string; name: string; distance: number }[];
}

const NUMERIC_WEIGHTS: Record<string, number> = {
  readability: 3,
  formality: 2,
  archaic: 2,
  study_features: 2,
};

const STRING_BONUS: Record<string, number> = {
  theological_tradition: 2,
  textual_basis: 1,
};

/**
 * Build a target TranslationProfile by accumulating weights from quiz answers.
 */
function buildTargetProfile(answers: Record<string, number>): TranslationProfile {
  const numericSums: Record<string, number[]> = {
    readability: [],
    formality: [],
    archaic: [],
    study_features: [],
  };

  const stringVotes: Record<string, Record<string, number>> = {
    theological_tradition: {},
    textual_basis: {},
  };

  for (const question of quizQuestions) {
    const answerIndex = answers[question.id];
    if (answerIndex === undefined || answerIndex < 0 || answerIndex >= question.options.length) {
      continue;
    }

    const weights = question.options[answerIndex].weights;

    for (const key of Object.keys(numericSums)) {
      const val = weights[key as keyof TranslationProfile];
      if (typeof val === "number") {
        numericSums[key].push(val);
      }
    }

    for (const key of Object.keys(stringVotes)) {
      const val = weights[key as keyof TranslationProfile];
      if (typeof val === "string") {
        stringVotes[key][val] = (stringVotes[key][val] || 0) + 1;
      }
    }
  }

  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 5);
  const topVote = (votes: Record<string, number>, fallback: string) => {
    const entries = Object.entries(votes);
    if (entries.length === 0) return fallback;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  return {
    readability: avg(numericSums.readability),
    formality: avg(numericSums.formality),
    archaic: avg(numericSums.archaic),
    study_features: avg(numericSums.study_features),
    theological_tradition: topVote(stringVotes.theological_tradition, "neutral"),
    textual_basis: topVote(stringVotes.textual_basis, "eclectic"),
  };
}

/**
 * Calculate weighted distance between target profile and a translation profile.
 * Lower = closer match.
 */
function calcDistance(target: TranslationProfile, entry: TranslationProfileEntry): number {
  let sumSq = 0;

  for (const [key, weight] of Object.entries(NUMERIC_WEIGHTS)) {
    const tVal = target[key as keyof TranslationProfile] as number;
    const eVal = entry.profile[key as keyof TranslationProfile] as number;
    const diff = (tVal - eVal) / 10; // normalize to 0-1
    sumSq += weight * diff * diff;
  }

  let distance = Math.sqrt(sumSq);

  // Apply bonuses for matching string axes (subtract from distance)
  for (const [key, bonus] of Object.entries(STRING_BONUS)) {
    const tVal = target[key as keyof TranslationProfile] as string;
    const eVal = entry.profile[key as keyof TranslationProfile] as string;
    if (tVal === eVal) {
      distance -= bonus;
    }
  }

  return distance;
}

/**
 * Classify translations into rough clusters for diversity picking.
 */
type Cluster = "literal" | "dynamic" | "study" | "alternative";

function classifyCluster(entry: TranslationProfileEntry): Cluster {
  const p = entry.profile;
  if (p.study_features >= 8) return "study";
  if (p.readability >= 8 && p.formality <= 4) return "dynamic";
  if (p.formality >= 7 && p.readability <= 5) return "literal";
  return "alternative";
}

/**
 * Score quiz answers and return translation recommendations.
 */
export function scoreQuiz(answers: Record<string, number>): QuizResult {
  const target = buildTargetProfile(answers);

  const scored = translationProfiles.map((entry) => ({
    id: entry.id,
    name: entry.name,
    distance: calcDistance(target, entry),
  }));

  scored.sort((a, b) => a.distance - b.distance);

  const primary = scored[0].id;

  // Pick diverse parallels: one from each cluster that isn't the primary
  const clustered = new Map<Cluster, typeof scored>();
  for (const s of scored) {
    if (s.id === primary) continue;
    const entry = translationProfiles.find((t) => t.id === s.id)!;
    const cluster = classifyCluster(entry);
    if (!clustered.has(cluster)) {
      clustered.set(cluster, []);
    }
    clustered.get(cluster)!.push(s);
  }

  const parallels: string[] = [];
  const clusterOrder: Cluster[] = ["literal", "dynamic", "study", "alternative"];

  for (const cluster of clusterOrder) {
    if (parallels.length >= 4) break;
    const candidates = clustered.get(cluster);
    if (candidates && candidates.length > 0) {
      // Pick best from this cluster that isn't already selected
      const pick = candidates.find((c) => !parallels.includes(c.id));
      if (pick) {
        parallels.push(pick.id);
      }
    }
  }

  // If we still need more parallels, fill from the sorted list
  if (parallels.length < 3) {
    for (const s of scored) {
      if (parallels.length >= 3) break;
      if (s.id !== primary && !parallels.includes(s.id)) {
        parallels.push(s.id);
      }
    }
  }

  return {
    primary,
    parallels,
    scores: scored,
  };
}
