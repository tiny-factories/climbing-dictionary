export const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const DEFAULT_DISTRIBUTION = {
  beginner: 0.34,
  intermediate: 0.33,
  advanced: 0.33,
};

const TERM_DISTRIBUTIONS = {
  belay: { beginner: 0.55, intermediate: 0.35, advanced: 0.1 },
  beta: { beginner: 0.2, intermediate: 0.5, advanced: 0.3 },
  campus: { beginner: 0.05, intermediate: 0.3, advanced: 0.65 },
  crimp: { beginner: 0.2, intermediate: 0.45, advanced: 0.35 },
  dyno: { beginner: 0.15, intermediate: 0.45, advanced: 0.4 },
  edging: { beginner: 0.2, intermediate: 0.5, advanced: 0.3 },
  flash: { beginner: 0.2, intermediate: 0.45, advanced: 0.35 },
  gaston: { beginner: 0.15, intermediate: 0.5, advanced: 0.35 },
  heelhook: { beginner: 0.25, intermediate: 0.5, advanced: 0.25 },
  "heel hook": { beginner: 0.25, intermediate: 0.5, advanced: 0.25 },
  jug: { beginner: 0.6, intermediate: 0.3, advanced: 0.1 },
  kneebar: { beginner: 0.08, intermediate: 0.4, advanced: 0.52 },
  "knee bar": { beginner: 0.08, intermediate: 0.4, advanced: 0.52 },
  mantle: { beginner: 0.18, intermediate: 0.52, advanced: 0.3 },
  match: { beginner: 0.45, intermediate: 0.4, advanced: 0.15 },
  moonboard: { beginner: 0.03, intermediate: 0.25, advanced: 0.72 },
  onsight: { beginner: 0.1, intermediate: 0.4, advanced: 0.5 },
  pinch: { beginner: 0.25, intermediate: 0.5, advanced: 0.25 },
  pocket: { beginner: 0.2, intermediate: 0.45, advanced: 0.35 },
  redpoint: { beginner: 0.1, intermediate: 0.45, advanced: 0.45 },
  slab: { beginner: 0.45, intermediate: 0.4, advanced: 0.15 },
  smear: { beginner: 0.32, intermediate: 0.5, advanced: 0.18 },
  toehook: { beginner: 0.16, intermediate: 0.5, advanced: 0.34 },
  "toe hook": { beginner: 0.16, intermediate: 0.5, advanced: 0.34 },
  undercling: { beginner: 0.22, intermediate: 0.45, advanced: 0.33 },
  volume: { beginner: 0.45, intermediate: 0.4, advanced: 0.15 },
};

const KEYWORD_DISTRIBUTIONS = [
  {
    keywords: ["v0", "v1", "5.6", "5.7", "beginner"],
    distribution: { beginner: 0.7, intermediate: 0.2, advanced: 0.1 },
  },
  {
    keywords: ["v2", "v3", "v4", "5.9", "5.10", "intermediate"],
    distribution: { beginner: 0.2, intermediate: 0.65, advanced: 0.15 },
  },
  {
    keywords: ["v7", "v8", "v9", "5.12", "5.13", "advanced", "elite"],
    distribution: { beginner: 0.05, intermediate: 0.3, advanced: 0.65 },
  },
];

const normalizeTerm = (term) =>
  term
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const inferDistribution = (term) => {
  const normalized = normalizeTerm(term);
  const directMatch = TERM_DISTRIBUTIONS[normalized];
  if (directMatch) {
    return directMatch;
  }

  const keywordMatch = KEYWORD_DISTRIBUTIONS.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword))
  );
  if (keywordMatch) {
    return keywordMatch.distribution;
  }

  return DEFAULT_DISTRIBUTION;
};

const getDominantLevel = (distribution) =>
  Object.entries(distribution).sort((a, b) => b[1] - a[1])[0][0];

export const mapTermsToExperienceBuckets = (terms = []) => {
  const counts = terms.reduce((acc, term) => {
    if (!term) return acc;
    acc.set(term, (acc.get(term) || 0) + 1);
    return acc;
  }, new Map());

  const buckets = EXPERIENCE_LEVELS.reduce(
    (acc, level) => ({ ...acc, [level.id]: [] }),
    {}
  );

  const totals = EXPERIENCE_LEVELS.reduce(
    (acc, level) => ({ ...acc, [level.id]: 0 }),
    {}
  );

  counts.forEach((occurrences, term) => {
    const distribution = inferDistribution(term);
    const dominantLevel = getDominantLevel(distribution);
    const confidence = distribution[dominantLevel];

    EXPERIENCE_LEVELS.forEach((level) => {
      totals[level.id] += distribution[level.id] * occurrences;
    });

    buckets[dominantLevel].push({
      term,
      occurrences,
      dominantLevel,
      confidence,
      distribution,
    });
  });

  EXPERIENCE_LEVELS.forEach((level) => {
    buckets[level.id].sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return a.term.localeCompare(b.term);
    });
  });

  return {
    buckets,
    totals,
    totalTerms: terms.length,
    uniqueTerms: counts.size,
  };
};
