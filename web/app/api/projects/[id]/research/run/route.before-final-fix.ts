import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

type Source = {
  index: number;
  title: string;
  url: string;
  content: string;
};

type Priority = "LOW" | "MEDIUM" | "HIGH";

type ActionPlan = {
  title: string;
  description: string;
  priority: Priority;
};

type ResearchScores = {
  frequency: number;
  severity: number;
  economicImpact: number;
  evidenceStrength: number;
  paymentPotential: number;
};

type ResearchFinding = {
  title: string;
  description: string;
  evidence: string;
  sourceIndex: number;
  scores: Partial<ResearchScores>;
  actions: ActionPlan[];
};

type ResearchOutput = {
  summary: string;
  report: string;
  findings: ResearchFinding[];
};

type VerifiedFinding = {
  title: string;
  description: string;
  evidence: string;
  sourceUrl: string;
  sourceName: string;
  scores: ResearchScores;
  opportunityScore: number;
  actions: ActionPlan[];
};

type PlannedAction = ActionPlan & {
  findingTitle: string;
  stage: 1 | 2 | 3 | 4 | 5 | 6;
};

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

const researchSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
    },

    report: {
      type: "string",
    },

    findings: {
      type: "array",
      minItems: 1,
      maxItems: 5,

      items: {
        type: "object",

        properties: {
          title: {
            type: "string",
          },

          description: {
            type: "string",
          },

          evidence: {
            type: "string",
          },

          sourceIndex: {
            type: "integer",
            minimum: 0,
          },

          scores: {
            type: "object",

            properties: {
              frequency: {
                type: "integer",
                minimum: 0,
                maximum: 100,
              },

              severity: {
                type: "integer",
                minimum: 0,
                maximum: 100,
              },

              economicImpact: {
                type: "integer",
                minimum: 0,
                maximum: 100,
              },

              evidenceStrength: {
                type: "integer",
                minimum: 0,
                maximum: 100,
              },

              paymentPotential: {
                type: "integer",
                minimum: 0,
                maximum: 100,
              },
            },

            required: [
              "frequency",
              "severity",
              "economicImpact",
              "evidenceStrength",
              "paymentPotential",
            ],
          },

          actions: {
            type: "array",
            minItems: 1,
            maxItems: 8,

            items: {
              type: "object",

              properties: {
                title: {
                  type: "string",
                },

                description: {
                  type: "string",
                },

                priority: {
                  type: "string",
                  enum: [
                    "LOW",
                    "MEDIUM",
                    "HIGH",
                  ],
                },
              },

              required: [
                "title",
                "description",
                "priority",
              ],
            },
          },
        },

        required: [
          "title",
          "description",
          "evidence",
          "sourceIndex",
          "scores",
          "actions",
        ],
      },
    },
  },

  required: [
    "summary",
    "report",
    "findings",
  ],
};

function getProjectId(id: string) {
  const projectId = Number(id);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0
  ) {
    return null;
  }

  return projectId;
}

function cleanJson(text: string) {
  let value = text.trim();

  if (value.startsWith("```")) {
    value = value
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  return value;
}

function clampScore(value: unknown) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return null;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

function normalizeFactor(
  value: unknown,
  neutral = 50
) {
  const score = clampScore(value);

  return score === null
    ? neutral
    : score;
}

function normalizePriority(
  priority: unknown,
  score: number
): Priority {
  if (
    priority === "HIGH" ||
    priority === "MEDIUM" ||
    priority === "LOW"
  ) {
    return priority;
  }

  if (score >= 85) {
    return "HIGH";
  }

  if (score >= 65) {
    return "MEDIUM";
  }

  return "LOW";
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\[\.\.\.\]/g, " ")
    .replace(/\.\.\./g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForMatch(value: string) {
  return value
    .replace(/\r/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getTokens(value: string) {
  const stopWords = new Set([
    "about",
    "after",
    "again",
    "also",
    "because",
    "being",
    "between",
    "could",
    "from",
    "have",
    "into",
    "more",
    "most",
    "other",
    "their",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "under",
    "using",
    "were",
    "which",
    "while",
    "with",
    "would",
    "your",
    "that",
    "than",
    "then",
    "such",
    "some",
    "small",
    "many",
    "very",
    "often",
    "real",
    "problem",
    "problems",
    "challenge",
    "challenges",
    "faced",
    "faces",
    "source",
    "according",
    "report",
    "found",
    "study",
    "article",
    "significant",
    "issue",
    "issues",
    "inability",
  ]);

  return Array.from(
    new Set(
      normalizeText(value)
        .split(" ")
        .filter(
          (token) =>
            token.length >= 4 &&
            !stopWords.has(token)
        )
    )
  );
}

function similarity(
  first: string,
  second: string
) {
  const firstTokens = new Set(
    getTokens(first)
  );

  const secondTokens = new Set(
    getTokens(second)
  );

  if (
    firstTokens.size === 0 ||
    secondTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (const token of firstTokens) {
    if (secondTokens.has(token)) {
      intersection++;
    }
  }

  const union = new Set([
    ...firstTokens,
    ...secondTokens,
  ]).size;

  return union === 0
    ? 0
    : intersection / union;
}

/*
 * =========================================
 * SEMANTIC GROUPS
 * =========================================
 */

const semanticGroups: string[][] = [
  [
    "staff",
    "staffing",
    "employee",
    "employees",
    "worker",
    "workers",
    "talent",
    "workforce",
    "recruit",
    "recruiting",
    "retention",
    "retain",
    "retaining",
    "hiring",
  ],

  [
    "patient",
    "patients",
    "resident",
    "residents",
    "consumer",
    "consumers",
    "client",
    "clients",
    "customer",
    "customers",
  ],

  [
    "financial",
    "finance",
    "finances",
    "money",
    "funding",
    "budget",
    "budgets",
    "revenue",
    "cost",
    "costs",
    "expense",
    "expenses",
    "reimbursement",
    "reimbursements",
    "payment",
    "payments",
  ],

  [
    "technology",
    "technologies",
    "software",
    "digital",
    "platform",
    "system",
    "systems",
  ],

  [
    "billing",
    "claims",
    "insurance",
    "invoicing",
    "reporting",
  ],

  [
    "marketing",
    "visibility",
    "promotion",
    "promote",
    "advertising",
    "brand",
    "branding",
  ],

  [
    "care",
    "clinical",
    "treatment",
    "follow-up",
    "followup",
  ],

  [
    "competition",
    "competitive",
    "competitor",
    "competitors",
    "market",
    "alternatives",
  ],
];

function tokensBelongToSameGroup(
  first: string,
  second: string
) {
  const firstTokens =
    getTokens(first);

  const secondTokens =
    getTokens(second);

  for (
    const group of semanticGroups
  ) {
    const firstMatch =
      firstTokens.some(
        (token) =>
          group.includes(token)
      );

    const secondMatch =
      secondTokens.some(
        (token) =>
          group.includes(token)
      );

    if (
      firstMatch &&
      secondMatch
    ) {
      return true;
    }
  }

  return false;
}

function semanticEvidenceMatch(
  finding: ResearchFinding,
  evidence: string
) {
  const findingTokens =
    getTokens(
      `${finding.title} ${finding.description}`
    );

  const evidenceTokens =
    getTokens(evidence);

  if (
    findingTokens.length === 0 ||
    evidenceTokens.length === 0
  ) {
    return {
      score: 0,
      strongMatch: false,
    };
  }

  let exactMatches = 0;

  for (
    const token of
    findingTokens
  ) {
    if (
      evidenceTokens.includes(token)
    ) {
      exactMatches++;
    }
  }

  const exactCoverage =
    exactMatches /
    findingTokens.length;

  let semanticMatches = 0;

  for (
    const findingToken of
    findingTokens
  ) {
    for (
      const evidenceToken of
      evidenceTokens
    ) {
      if (
        tokensBelongToSameGroup(
          findingToken,
          evidenceToken
        )
      ) {
        semanticMatches++;
        break;
      }
    }
  }

  const semanticCoverage =
    semanticMatches /
    findingTokens.length;

  const score =
    exactCoverage * 0.6 +
    semanticCoverage * 0.4;

  const strongMatch =
    findingTokens.length <= 2
      ? score >= 0.5
      : score >= 0.45 &&
        (
          exactMatches >= 2 ||
          semanticMatches >= 2
        );

  return {
    score,
    strongMatch,
  };
}

/*
 * =========================================
 * SOURCE CLEANING
 * =========================================
 */

function stripMarkdownNoise(
  sentence: string
) {
  let value = sentence;

  value = value.replace(
    /\s+#{1,6}\s+.*$/g,
    ""
  );

  value = value.replace(
    /^\s*(?:[-*•▪◦]\s+)/,
    ""
  );

  value = value.replace(
    /\s+\[(?:source|citation)\s*\d*\]\s*/gi,
    " "
  );

  value = value.replace(
    /\[\.\.\.\]/g,
    ""
  );

  value = value.replace(
    /\.\.\./g,
    ""
  );

  value = value.replace(
    /[*_`]/g,
    ""
  );

  return value
    .replace(/\s+/g, " ")
    .trim();
}

function cleanSentence(
  sentence: string
) {
  return stripMarkdownNoise(
    sentence
  );
}

function isBadEvidenceSentence(
  sentence: string
) {
  const text =
    sentence.trim();

  if (text.length < 45) {
    return true;
  }

  if (
    text.includes("[...]") ||
    text.includes("...")
  ) {
    return true;
  }

  if (
    /^https?:\/\//i.test(text)
  ) {
    return true;
  }

  if (
    /^source\s+\d+/i.test(text)
  ) {
    return true;
  }

  if (
    /^#{1,6}\s/.test(text)
  ) {
    return true;
  }

  if (
    /\(\s*\d+\s+mentions?\s*\)/i.test(
      text
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Reject source sentences that primarily describe a solution, intervention,
 * product, vendor, or recommendation. Problem evidence should describe the
 * underlying pain, barrier, cost, failure, shortage, delay, or consequence.
 */
function isSolutionEvidenceSentence(
  sentence: string
) {
  const text = normalizeText(sentence);

  const solutionPatterns = [
    /\b(?:our|its|their|the)\s+(?:platform|software|app|application|product|service|solution|tool|system)\b/,
    /\b(?:offers?|provides?|delivers?|providing|delivering)\b.{0,80}\b(?:service|solution|platform|software|tool|program|care|support)\b/,
    /\b(?:helps?|helping|allows?|enables?|enabling|designed to|built to|created to|developed to)\b/,
    /\b(?:can|could|will|would)\s+(?:help|improve|reduce|streamline|automate|simplify|solve|address|alleviate)\b/,
    /\b(?:use|using|adopt|adopting|implement|implementing|leverage|leveraging)\b.{0,80}\b(?:software|technology|platform|tool|system|app|application|service|solution)\b/,
    /\b(?:launch(?:ed)?|introduc(?:ed|es)|develop(?:ed|s)|creat(?:ed|es)|built|deployed)\b.{0,100}\b(?:platform|software|app|application|product|service|solution|tool)\b/,
    /\b(?:customers?|clinics?|patients?|organizations?|businesses?)\s+(?:can|could|should)\s+(?:use|adopt|implement|leverage)\b/,
    /\b(?:recommended|recommendation|best practice|approach|strategy)\b/
  ];

  return solutionPatterns.some((pattern) => pattern.test(text));
}

function splitIntoSentences(
  text: string
) {
  const prepared =
    text
      .replace(
        /#{1,6}\s+[^\n]+/g,
        " "
      )
      .replace(/\r/g, " ")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  return prepared
    .split(
      /(?<=[.!?])\s+(?=[A-Z0-9])/
    )
    .map(cleanSentence)
    .filter(
      (sentence) =>
        !isBadEvidenceSentence(
          sentence
        )
    );
}

/*
 * =========================================
 * EXACT SOURCE CHECK
 * =========================================
 */

function sentenceExistsInSource(
  sentence: string,
  source: Source
) {
  const normalizedSentence =
    normalizeForMatch(
      sentence
    );

  const normalizedSource =
    normalizeForMatch(
      source.content
    );

  return normalizedSource.includes(
    normalizedSentence
  );
}

function evidenceIsUsable(
  passages: string[],
  source: Source
) {
  if (passages.length === 0) {
    return false;
  }

  return passages.every(
    (passage) =>
      passage.length >= 60 &&
      passage.length <= 1200 &&
      !isBadEvidenceSentence(
        passage
      ) &&
      sentenceExistsInSource(
        passage,
        source
      )
  );
}

/*
 * =========================================
 * DETERMINISTIC EVIDENCE EXTRACTION
 * =========================================
 */

function extractEvidencePassages(
  finding: ResearchFinding,
  source: Source
) {
  const raw = source.content
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!raw) {
    return [];
  }

  /*
   * SOURCE-FIRST EXTRACTION
   *
   * This function only extracts passages that actually exist in the
   * original Tavily source. Semantic validation is performed later by
   * the deterministic Evidence Gate. Keeping these responsibilities
   * separate prevents valid source passages from being discarded too
   * early because the finding uses different wording.
   */

  const paragraphs = raw
    .split(/\n\s*\n/)
    .map((text) => stripMarkdownNoise(text).trim())
    .filter(
      (text) =>
        text.length >= 40 &&
        text.length <= 2000 &&
        !isBadEvidenceSentence(text)
    );

  const candidates: string[] = [];

  /* Prefer individual sentences. */
  for (const paragraph of paragraphs) {
    const sentences = splitIntoSentences(paragraph);

    for (const sentence of sentences) {
      const clean = sentence.trim();

      if (
        clean.length >= 60 &&
        clean.length <= 700 &&
        !isBadEvidenceSentence(clean) &&
        !isSolutionEvidenceSentence(clean) &&
        sentenceExistsInSource(clean, source)
      ) {
        candidates.push(clean);
      }
    }

    /* Preserve two consecutive problem sentences when context is needed. */
    if (sentences.length > 1) {
      for (let i = 0; i < sentences.length - 1; i++) {
        const pair = `${sentences[i]} ${sentences[i + 1]}`.trim();

        if (
          pair.length >= 80 &&
          pair.length <= 1000 &&
          !isBadEvidenceSentence(pair) &&
          !isSolutionEvidenceSentence(pair) &&
          sentenceExistsInSource(pair, source)
        ) {
          candidates.push(pair);
        }
      }
    }
  }

  /* Fallback for Tavily content returned as one large block. */
  if (candidates.length === 0) {
    const sentences = splitIntoSentences(raw);

    for (const sentence of sentences) {
      const clean = sentence.trim();

      if (
        clean.length >= 60 &&
        clean.length <= 700 &&
        !isBadEvidenceSentence(clean) &&
        !isSolutionEvidenceSentence(clean) &&
        sentenceExistsInSource(clean, source)
      ) {
        candidates.push(clean);
      }
    }
  }

  const unique = candidates.filter(
    (passage, index, array) =>
      array.findIndex(
        (other) => similarity(other, passage) >= 0.90
      ) === index
  );

  /*
   * Rank candidates using lexical overlap only.
   * Do NOT call semanticEvidenceMatch() here.
   */
  const findingTokens = new Set(
    getTokens(`${finding.title} ${finding.description}`)
  );

  const ranked = unique
    .map((passage) => {
      const passageTokens = getTokens(passage);
      let matches = 0;

      for (const token of passageTokens) {
        if (findingTokens.has(token)) {
          matches++;
        }
      }

      return {
        passage,
        overlap:
          findingTokens.size > 0
            ? matches / findingTokens.size
            : 0,
      };
    })
    .sort((a, b) => b.overlap - a.overlap);

  const selected: string[] = [];

  for (const item of ranked) {
    if (
      selected.some(
        (existing) => similarity(existing, item.passage) >= 0.65
      )
    ) {
      continue;
    }

    selected.push(item.passage);

    if (selected.length >= 2) {
      break;
    }
  }

  return selected;
}

/*
 * =========================================
 * SOURCE MATCHING
 * =========================================
 */

function calculateEvidenceAlignment(
  finding: ResearchFinding,
  source: Source
) {
  const findingTokens =
    getTokens(
      `${finding.title} ${finding.description}`
    );

  if (
    findingTokens.length === 0
  ) {
    return 0;
  }

  const sourceText =
    normalizeText(
      `${source.title} ${source.content}`
    );

  let matches = 0;

  for (
    const token of
    findingTokens
  ) {
    if (
      sourceText.includes(
        token
      )
    ) {
      matches++;
    }
  }

  return (
    matches /
    findingTokens.length
  );
}

function findSource(
  finding: ResearchFinding,
  sources: Source[]
) {
  if (
    Number.isInteger(
      finding.sourceIndex
    ) &&
    finding.sourceIndex >= 0 &&
    finding.sourceIndex <
      sources.length
  ) {
    return sources[
      finding.sourceIndex
    ];
  }

  const ranked =
    sources
      .map(
        (source) => ({
          source,
          score:
            calculateEvidenceAlignment(
              finding,
              source
            ),
        })
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  return ranked[0]?.source ?? null;
}

/*
 * =========================================
 * EVIDENCE STRENGTH
 * =========================================
 */

function calculateEvidenceStrength(
  finding: ResearchFinding,
  evidence: string,
  source: Source
) {
  if (
    evidence.length < 60
  ) {
    return 0;
  }

  const semantic =
    semanticEvidenceMatch(
      finding,
      evidence
    );

  const sourceQuality =
    source.content.length >=
    1500
      ? 100
      : source.content.length >=
        800
      ? 90
      : source.content.length >=
        400
      ? 80
      : 70;

  return (
    clampScore(
      semantic.score * 70 +
        sourceQuality *
          0.3
    ) ?? 50
  );
}

/*
 * =========================================
 * SCORE
 * =========================================
 */

function normalizeScores(
  scores: Partial<ResearchScores>
): ResearchScores {
  return {
    frequency:
      normalizeFactor(
        scores.frequency
      ),

    severity:
      normalizeFactor(
        scores.severity
      ),

    economicImpact:
      normalizeFactor(
        scores.economicImpact
      ),

    evidenceStrength:
      normalizeFactor(
        scores.evidenceStrength
      ),

    paymentPotential:
      normalizeFactor(
        scores.paymentPotential
      ),
  };
}

function calculateOpportunityScore(
  scores: ResearchScores
) {
  const score =
    scores.frequency *
      0.2 +
    scores.severity *
      0.2 +
    scores.economicImpact *
      0.2 +
    scores.evidenceStrength *
      0.25 +
    scores.paymentPotential *
      0.15;

  return (
    clampScore(score) ??
    50
  );
}

/*
 * =========================================
 * PROBLEM FILTER
 * =========================================
 */

function looksLikeSolution(
  title: string,
  description: string
) {
  const text =
    normalizeText(
      `${title} ${description}`
    );

  const patterns = [
    /\bcustom software\b/,
    /\bsoftware solution\b/,
    /\bai solution\b/,
    /\bai powered\b/,
    /\bai chatbot\b/,
    /\bvirtual assistant\b/,
    /\bplatform\b/,
    /\bmobile app\b/,
    /\bapplication\b/,
    /\bproduct\b/,
    /\bsystem implementation\b/,
    /\btechnology solution\b/,
    /\bexpand .*program\b/,
    /\blaunch .*service\b/,
  ];

  return patterns.some(
    (pattern) =>
      pattern.test(text)
  );
}

function looksLikeProblem(
  title: string,
  description: string
) {
  const text =
    normalizeText(
      `${title} ${description}`
    );

  const patterns = [
    /\bstruggle\b/,
    /\bstruggles\b/,
    /\bchallenge\b/,
    /\bchallenges\b/,
    /\bdifficulty\b/,
    /\bdifficult\b/,
    /\bshortage\b/,
    /\bbarrier\b/,
    /\bbarriers\b/,
    /\bhigh cost\b/,
    /\blow reimbursement\b/,
    /\bfinancial constraint\b/,
    /\binefficien/,
    /\bdelay\b/,
    /\bdelays\b/,
    /\bfrustrat/,
    /\black of\b/,
    /\blimited access\b/,
    /\boverload\b/,
    /\bburden\b/,
    /\bmanual\b/,
    /\bexpensive\b/,
    /\bpoor\b/,
    /\binsufficient\b/,
    /\binadequate\b/,
    /\bdifficult to\b/,
    /\bunable to\b/,
    /\binability to\b/,
  ];

  return patterns.some(
    (pattern) =>
      pattern.test(text)
  );
}

/*
 * =========================================
 * ACTION HELPERS
 * =========================================
 */

function deduplicateActions<T extends ActionPlan>(
  actions: T[]
): T[] {
  const result: T[] =
    [];

  const priorityRank = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  for (const action of actions) {
    const existingIndex =
      result.findIndex(
        (existing) =>
          similarity(
            `${existing.title} ${existing.description}`,
            `${action.title} ${action.description}`
          ) >= 0.55
      );

    if (
      existingIndex === -1
    ) {
      result.push(action);
      continue;
    }

    if (
      priorityRank[
        action.priority
      ] >
      priorityRank[
        result[existingIndex]
          .priority
      ]
    ) {
      result[existingIndex] =
        action;
    }
  }

  return result;
}

function mergeFindings(
  findings: VerifiedFinding[]
) {
  const result:
    VerifiedFinding[] = [];

  for (const finding of findings) {
    const existingIndex =
      result.findIndex(
        (existing) =>
          similarity(
            `${existing.title} ${existing.description}`,
            `${finding.title} ${finding.description}`
          ) >= 0.62
      );

    if (
      existingIndex === -1
    ) {
      result.push(finding);
      continue;
    }

    const existing =
      result[existingIndex];

    const scores:
      ResearchScores = {
      frequency:
        Math.max(
          existing.scores.frequency,
          finding.scores.frequency
        ),

      severity:
        Math.max(
          existing.scores.severity,
          finding.scores.severity
        ),

      economicImpact:
        Math.max(
          existing.scores.economicImpact,
          finding.scores.economicImpact
        ),

      evidenceStrength:
        Math.max(
          existing.scores.evidenceStrength,
          finding.scores.evidenceStrength
        ),

      paymentPotential:
        Math.max(
          existing.scores.paymentPotential,
          finding.scores.paymentPotential
        ),
    };

    result[
      existingIndex
    ] = {
      ...existing,

      description:
        `${existing.description} ${finding.description}`.trim(),

      evidence:
        `${existing.evidence} ${finding.evidence}`.trim(),

      scores,

      opportunityScore:
        calculateOpportunityScore(
          scores
        ),

      actions:
        deduplicateActions([
          ...existing.actions,
          ...finding.actions,
        ]),
    };
  }

  return result;
}

/*
 * =========================================
 * ACTION STAGES
 * =========================================
 */

function getStage(
  title: string,
  description: string
): 1 | 2 | 3 | 4 | 5 | 6 {
  const text =
    normalizeText(
      `${title} ${description}`
    );

  /*
   * STAGE 6
   * Build / implementation.
   */

  if (
    /implement .*software|develop .*software|build .*software|create .*app|create .*platform|launch .*platform|deploy .*system|custom software|build .*product|develop .*product|use ai|use .*platform/.test(
      text
    )
  ) {
    return 6;
  }

  /*
   * STAGE 1
   */

  if (
    /customer validation|customer interview|user interview|interview|survey|talk to|speak with|observe potential customers|observe users/.test(
      text
    )
  ) {
    return 1;
  }

  /*
   * STAGE 2
   * Competitor / alternative research only.
   */

  if (
    /compare .*competitor|compare .*alternative|compare .*solution|competitor research|competitive research|analyze competitors|analyze alternatives|existing alternatives|existing solutions|market research|market gap|competitive landscape|research competitors|research alternatives/.test(
      text
    )
  ) {
    return 2;
  }

  /*
   * STAGE 3
   */

  if (
    /economic validation|willingness to pay|pricing|paying customer|monetization|price test|budget|spend|current spending/.test(
      text
    )
  ) {
    return 3;
  }

  /*
   * STAGE 4
   */

  if (
    /problem validation|validation experiment|lightweight experiment|run .*experiment|pilot|pilot test|landing page|smoke test|manual workflow|manual pilot|test the problem|run a test|small experiment|proof of demand/.test(
      text
    )
  ) {
    return 4;
  }

  /*
   * STAGE 5
   */

  if (
    /mvp|minimum viable product|define .*mvp|product scope|success metrics|essential workflow|smallest useful product|mvp requirements/.test(
      text
    )
  ) {
    return 5;
  }

  return 6;
}

function isBuildAction(
  title: string,
  description: string
) {
  return (
    getStage(
      title,
      description
    ) === 6
  );
}

/*
 * =========================================
 * FALLBACK ACTIONS
 * =========================================
 */

function fallbackAction(
  finding: VerifiedFinding,
  stage: 1 | 2 | 3 | 4 | 5
): ActionPlan {
  if (stage === 1) {
    return {
      title:
        `Interview 5-10 potential customers about "${finding.title}"`,
      description:
        "Confirm how often the problem occurs, how painful it is, and what customers currently do instead.",
      priority:
        finding.opportunityScore >= 85
          ? "HIGH"
          : "MEDIUM",
    };
  }

  if (stage === 2) {
    return {
      title:
        `Compare 5 existing alternatives for "${finding.title}"`,
      description:
        "Identify what people use today, what competitors offer, what works well, and where alternatives fail.",
      priority: "MEDIUM",
    };
  }

  if (stage === 3) {
    return {
      title:
        `Test willingness to pay for "${finding.title}"`,
      description:
        "Understand current spending, budgets, and whether potential customers would pay for a better outcome.",
      priority: "MEDIUM",
    };
  }

  if (stage === 4) {
    return {
      title:
        `Run a lightweight validation experiment for "${finding.title}"`,
      description:
        "Use a pilot, manual workflow, landing page, smoke test, or another low-cost experiment to test the problem.",
      priority: "LOW",
    };
  }

  return {
    title:
      `Define an MVP for "${finding.title}" after validation`,
    description:
      "Define the smallest useful product, essential workflow, and success metrics only after earlier validation succeeds.",
    priority: "LOW",
  };
}

function chooseAction(
  actions: PlannedAction[],
  stage: 1 | 2 | 3 | 4 | 5
) {
  const candidates =
    actions.filter(
      (action) =>
        action.stage === stage &&
        !isBuildAction(
          action.title,
          action.description
        )
    );

  if (
    candidates.length === 0
  ) {
    return null;
  }

  const priorityRank = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const unique =
    deduplicateActions(
      candidates
    );

  unique.sort((a, b) => {
    const priorityDifference =
      priorityRank[
        b.priority
      ] -
      priorityRank[
        a.priority
      ];

    if (
      priorityDifference !==
      0
    ) {
      return priorityDifference;
    }

    return (
      b.description.length -
      a.description.length
    );
  });

  return unique[0] ?? null;
}

/*
 * =========================================
 * POST
 * =========================================
 */

export async function POST(
  req: Request,
  context: Context
) {
  let runId:
    number | null = null;

  try {
    const { id } =
      await context.params;

    const projectId =
      getProjectId(id);

    if (!projectId) {
      return NextResponse.json(
        {
          error:
            "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await req.json();

    const jobId =
      Number(body.jobId);

    if (
      !Number.isInteger(jobId) ||
      jobId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid research job ID.",
        },
        {
          status: 400,
        }
      );
    }

    const job =
      await prisma.researchJob.findFirst(
        {
          where: {
            id: jobId,
            projectId,
          },
        }
      );

    if (!job) {
      return NextResponse.json(
        {
          error:
            "Research job not found.",
        },
        {
          status: 404,
        }
      );
    }

    const project =
      await prisma.project.findUnique(
        {
          where: {
            id: projectId,
          },

          select: {
            id: true,
            name: true,
            description: true,

            memories: {
              orderBy: {
                createdAt:
                  "desc",
              },

              take: 25,
            },
          },
        }
      );

    if (!project) {
      return NextResponse.json(
        {
          error:
            "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    const run =
      await prisma.researchRun.create(
        {
          data: {
            researchJobId:
              job.id,

            status:
              "RUNNING",

            startedAt:
              new Date(),
          },
        }
      );

    runId = run.id;

    await prisma.researchJob.update(
      {
        where: {
          id: job.id,
        },

        data: {
          status:
            "RUNNING",
        },
      }
    );

    /*
     * =========================================
     * 1. SEARCH
     * =========================================
     */

    const topic =
      job.topic.trim();

    const instructions =
      job.instructions.trim();

    const queries = [
      `${topic} real customer problems pain points complaints`,
      `${topic} users complaints frustrations reviews`,
      `${topic} underserved customers market gaps`,
      `${topic} competitors limitations alternatives`,
    ];

    const sources: Source[] =
      [];

    for (const query of queries) {
      try {
        const result =
          await tvly.search(
            query,
            {
              maxResults: 5,
              searchDepth:
                "advanced",
              includeAnswer:
                true,
            }
          );

        for (
          const item of
          result.results
        ) {
          const url =
            String(
              item.url ??
                ""
            ).trim();

          if (!url) {
            continue;
          }

          if (
            sources.some(
              (source) =>
                source.url ===
                url
            )
          ) {
            continue;
          }

          sources.push({
            index:
              sources.length,

            title:
              String(
                item.title ??
                  ""
              ).trim(),

            url,

            content:
              String(
                item.content ??
                  ""
              ).trim(),
          });
        }
      } catch (error) {
        console.error(
          "Tavily query failed:",
          query,
          error
        );
      }
    }

    if (
      sources.length === 0
    ) {
      throw new Error(
        "No web research sources were returned."
      );
    }

    /*
     * =========================================
     * 2. MEMORY
     * =========================================
     */

    const memoryContext =
      project.memories.length >
      0
        ? project.memories
            .map(
              (memory) =>
                `- ${memory.content}`
            )
            .join("\n")
        : "No project memories.";

    /*
     * =========================================
     * 3. WEB CONTEXT
     * =========================================
     */

    const webContext =
      sources
        .map(
          (source) => `
SOURCE ${source.index}

TITLE:
${source.title}

URL:
${source.url}

CONTENT:
${source.content}
`
        )
        .join(
          "\n\n====================\n\n"
        );

    /*
     * =========================================
     * 4. AI RESEARCH
     * =========================================
     */

    const ollamaResponse =
      await fetch(
        "http://127.0.0.1:11434/api/generate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            model:
              "llama3.2",

            stream:
              false,

            format:
              researchSchema,

            options: {
              temperature:
                0,
            },

            prompt: `
You are Anvesha Research Engine.

Find genuine, recurring CUSTOMER PROBLEMS from the supplied web research.

PROJECT:
${project.name}

PROJECT DESCRIPTION:
${project.description}

TOPIC:
${topic}

INSTRUCTIONS:
${
  instructions ||
  "Find recurring real-world problems, strong evidence, underserved needs, and startup opportunities."
}

PROJECT MEMORY:
${memoryContext}

====================
WEB RESEARCH
====================

${webContext}

====================
CRITICAL RESEARCH RULES
====================

1. FIND PROBLEMS, NOT SOLUTIONS.

A finding must describe a real-world problem experienced by customers, users, organizations, or a clearly defined population.

GOOD FINDINGS:
- Patients struggle to access affordable healthcare.
- Small clinics face difficulty recruiting qualified staff.
- Customers experience long waiting times.
- Businesses spend excessive time on administrative work.
- Underserved communities lack reliable access to essential services.

BAD FINDINGS:
- AI assistant
- AI platform
- mobile application
- software
- mobile clinic
- chatbot
- marketplace
- service
- product

Do NOT turn a solution into a finding.

====================
2. EVIDENCE MUST PROVE THE PROBLEM
====================

The evidence field is critical. Evidence MUST come directly from one of the supplied SOURCE entries and must demonstrate or support the existence of the problem.

GOOD EVIDENCE:
- documented access barriers
- customer complaints or frustrations
- reported shortages
- cost barriers
- waiting times
- staffing shortages
- measured operational or financial consequences
- statistics or factual findings contained in the source

BAD EVIDENCE:
- a company operates a product
- a company offers a service
- a company launched an application
- a company provides a solution

For example, if the finding is "Patients struggle to access affordable healthcare", evidence should describe the access or affordability problem.
"MEDLIFE operates mobile clinics that provide healthcare" is NOT evidence of the problem; it describes a solution.

NEVER use a company's product, service, intervention, or solution as evidence for the problem.

====================
3. SOURCE INDEX MUST MATCH
====================

sourceIndex must identify the exact supplied source containing the evidence. Do not select a source merely because it discusses the general topic.

====================
4. DO NOT INVENT EVIDENCE
====================

Never fabricate statistics, percentages, quotes, complaints, market sizes, survey results, or facts. Only use information contained in the supplied sources.

====================
5. EVIDENCE FIELD
====================

The evidence field should be a concise factual statement derived from the selected source. It should answer: "Why should we believe this problem exists?" It must NOT answer: "What solution is being offered?"

====================
6. PROBLEM QUALITY
====================

Prefer findings demonstrating recurring frequency, meaningful severity, economic impact, unmet need, customer frustration, operational difficulty, measurable consequences, or payment potential. Avoid vague findings.

====================
7. SCORES
====================

Scores must reflect the supplied evidence. Do not use 0 unless the source provides essentially no support.

frequency: How frequently the problem occurs.
severity: How serious the consequences are.
economicImpact: How much financial or operational impact the problem creates.
evidenceStrength: How strongly the supplied source supports the problem.
paymentPotential: How likely the affected customer or organization could reasonably pay to solve the problem.

Do not inflate scores.

====================
8. ACTIONS
====================

Actions must describe validation activities, NOT products.

GOOD:
- Interview affected customers.
- Compare existing alternatives.
- Measure current workflow costs.
- Test willingness to pay.
- Run a manual pilot.

BAD:
- Build an AI assistant.
- Build an app.
- Launch a platform.
- Create a chatbot.

Do not jump directly to building a product.

====================
9. RESEARCH STANDARD
====================

Only return a finding when the supplied source contains meaningful evidence for the problem. If a source only describes a company's solution, do NOT use that solution as evidence. If evidence is insufficient, choose a different problem with stronger evidence.

====================
EVIDENCE PURITY RULE
====================

The evidence saved by Anvesha must contain ONLY source text that supports the
problem itself. Do not include a sentence merely because it appears near the
problem in the article.

If a source paragraph says both:
- small clinics have financial or administrative constraints, AND
- a vendor's software/platform/service can solve those constraints,
then the evidence should contain only the sentence(s) describing the constraint
and its consequences. Exclude the vendor/product/solution sentence.

Never use promotional language, product descriptions, recommendations, calls
to adopt a tool, or descriptions of how a solution works as problem evidence.

====================
ACTION RULES
====================

Stage 1: Customer interviews / observation.
Stage 2: Competitor research / alternative comparison / market-gap analysis only.
Stage 3: Willingness-to-pay / economic validation.
Stage 4: Pilot / experiment / smoke test / landing-page test / manual workflow.
Stage 5: MVP definition.
"Offer competitive benefits" is NOT Stage 2.
"Use AI" is NOT Stage 5.

Return ONLY JSON.
`,
          }),
        }
      );

    if (
      !ollamaResponse.ok
    ) {
      const errorText =
        await ollamaResponse.text();

      throw new Error(
        `Ollama failed: ${errorText}`
      );
    }

    const ollamaData =
      await ollamaResponse.json();

    const raw =
      String(
        ollamaData.response ??
          ""
      );

    console.log(
      "Research AI raw response:",
      raw
    );

    if (!raw.trim()) {
      throw new Error(
        "Ollama returned an empty response."
      );
    }

    let analysis:
      ResearchOutput;

    try {
      analysis =
        JSON.parse(
          cleanJson(raw)
        );
    } catch {
      throw new Error(
        "Ollama returned invalid research JSON."
      );
    }

    if (
      !Array.isArray(
        analysis.findings
      ) ||
      analysis.findings.length ===
        0
    ) {
      throw new Error(
        "Research AI returned no findings."
      );
    }

    /*
     * =========================================
     * 5. DETERMINISTIC EVIDENCE GATE
     * =========================================
     */

    const accepted:
      VerifiedFinding[] =
      [];

    let sourceRejectedCount =
      0;

    let weakEvidenceCount =
      0;

    let evidenceRejectedCount =
      0;

    let semanticMismatchCount =
      0;

    let solutionRejectedCount =
      0;

    for (
      const finding of
      analysis.findings
    ) {
      const source =
        findSource(
          finding,
          sources
        );

      if (!source) {
        sourceRejectedCount++;
        continue;
      }

      const alignment =
        calculateEvidenceAlignment(
          finding,
          source
        );

      if (
        alignment < 0.12
      ) {
        weakEvidenceCount++;
        continue;
      }

      /*
       * Extract original source passages.
       * No second Ollama call.
       */

      const passages =
        extractEvidencePassages(
          finding,
          source
        );

      console.log("\n========== EVIDENCE DEBUG ==========");
      console.log("Finding:", finding.title);
      console.log("Description:", finding.description);
      console.log("Model evidence:", finding.evidence);
      console.log("Source index:", finding.sourceIndex);
      console.log("Source title:", source.title);
      console.log("Source URL:", source.url);
      console.log("Source content length:", source.content.length);
      console.log("Extracted passages:", passages.length);

      passages.forEach((passage, index) => {
        console.log(`--- Passage ${index + 1} ---`);
        console.log(passage);
      });

      if (passages.length === 0) {
        console.log("❌ EVIDENCE REJECTED: No passages extracted.");
        console.log("====================================\n");
        evidenceRejectedCount++;
        continue;
      }

      const usableEvidence =
        evidenceIsUsable(
          passages,
          source
        );

      console.log("Evidence usable:", usableEvidence);

      if (!usableEvidence) {
        console.log("❌ EVIDENCE REJECTED: evidenceIsUsable() returned false.");
        console.log("====================================\n");
        evidenceRejectedCount++;
        continue;
      }

      console.log("✅ Evidence passed extraction and usability.");

      /*
       * Semantic finding ↔ evidence gate.
       */

      const semanticResults =
        passages.map((passage) => {
          const result =
            semanticEvidenceMatch(
              finding,
              passage
            );

          console.log("SEMANTIC EVIDENCE CHECK:", {
            strongMatch: result.strongMatch,
            passage: passage.slice(0, 500),
          });

          return { passage, result };
        });

      const validEvidence =
        semanticResults
          .filter(({ result }) => result.strongMatch)
          .map(({ passage }) => passage);

      console.log("Valid semantic evidence:", validEvidence.length);

      if (validEvidence.length === 0) {
        console.log("❌ SEMANTIC MISMATCH");
        console.log("====================================\n");
        semanticMismatchCount++;
        continue;
      }

      console.log("✅ Semantic evidence gate passed.");
      console.log("====================================\n");

      const evidenceText =
        validEvidence
          .filter(
            (passage) =>
              !isSolutionEvidenceSentence(
                passage
              )
          )
          .join(" ");

      if (evidenceText.trim().length < 60) {
        console.log(
          "❌ EVIDENCE REJECTED: Clean problem evidence became too short after solution filtering."
        );
        evidenceRejectedCount++;
        continue;
      }

      /*
       * Score factors.
       */

      const scores =
        normalizeScores(
          finding.scores
        );

      scores.evidenceStrength =
        Math.max(
          scores.evidenceStrength,
          calculateEvidenceStrength(
            finding,
            evidenceText,
            source
          )
        );

      if (
        scores.evidenceStrength <
        35
      ) {
        weakEvidenceCount++;
        continue;
      }

      const opportunityScore =
        calculateOpportunityScore(
          scores
        );

      const cleanTitle =
        finding.title.trim();

      const cleanDescription =
        finding.description.trim();

      /*
       * Reject solutions.
       */

      if (
        looksLikeSolution(
          cleanTitle,
          cleanDescription
        ) &&
        !looksLikeProblem(
          cleanTitle,
          cleanDescription
        )
      ) {
        solutionRejectedCount++;
        continue;
      }

      /*
       * Require a problem.
       */

      if (
        !looksLikeProblem(
          cleanTitle,
          cleanDescription
        )
      ) {
        solutionRejectedCount++;
        continue;
      }

      /*
       * Actions.
       */

      const actions =
        Array.isArray(
          finding.actions
        )
          ? finding.actions
              .map(
                (action) => ({
                  title:
                    String(
                      action.title ??
                        ""
                    ).trim(),

                  description:
                    String(
                      action.description ??
                        ""
                    ).trim(),

                  priority:
                    normalizePriority(
                      action.priority,
                      opportunityScore
                    ),
                })
              )
              .filter(
                (action) =>
                  action.title &&
                  action.description
              )
          : [];

      accepted.push({
        title:
          cleanTitle,

        description:
          cleanDescription,

        evidence:
          evidenceText,

        sourceUrl:
          source.url,

        sourceName:
          source.title ||
          source.url,

        scores,

        opportunityScore,

        actions,
      });
    }

    /*
     * =========================================
     * 6. NO FINDINGS
     * =========================================
     */

    if (
      accepted.length === 0
    ) {
      const emptyRun =
        await prisma.researchRun.update(
          {
            where: {
              id: run.id,
            },

            data: {
              status:
                "COMPLETED",

              completedAt:
                new Date(),

              summary:
                "Research completed, but no finding passed the source, evidence, semantic, and problem-quality gates.",

              report:
                "No unsupported finding was saved. Evidence is now extracted deterministically from the original research source.",

              error:
                `${sourceRejectedCount} source-rejected; ${weakEvidenceCount} weak-evidence; ${evidenceRejectedCount} evidence-rejected; ${semanticMismatchCount} semantic mismatch; ${solutionRejectedCount} solution/problem rejected.`,
            },
          }
        );

      await prisma.researchJob.update(
        {
          where: {
            id: job.id,
          },

          data: {
            status:
              "COMPLETED",
          },
        }
      );

      return NextResponse.json({
        success: true,

        run:
          emptyRun,

        sourceCount:
          sources.length,

        rawFindingCount:
          analysis.findings
            .length,

        acceptedFindingCount:
          0,

        sourceRejectedCount,

        weakEvidenceCount,

        evidenceRejectedCount,

        semanticMismatchCount,

        solutionRejectedCount,

        memoriesCreated:
          0,

        tasksCreated:
          0,

        actionPlan: [],
      });
    }

    /*
     * =========================================
     * 7. MERGE
     * =========================================
     */

    const verifiedFindings =
      mergeFindings(
        accepted
      );

    const primaryFinding =
      [...verifiedFindings].sort(
        (a, b) =>
          b.opportunityScore -
          a.opportunityScore
      )[0];

    if (!primaryFinding) {
      throw new Error(
        "No primary finding available."
      );
    }

    /*
     * =========================================
     * 8. FIVE-STAGE ACTION PLAN
     * =========================================
     */

    const planned:
      PlannedAction[] =
      primaryFinding.actions
        .map(
          (action) => ({
            ...action,

            findingTitle:
              primaryFinding.title,

            stage:
              getStage(
                action.title,
                action.description
              ),
          })
        )
        .filter(
          (action) =>
            action.stage <= 5
        );

    const selected:
      PlannedAction[] =
      [];

    for (
      const stage of [
        1,
        2,
        3,
        4,
      ] as const
    ) {
      const action =
        chooseAction(
          planned,
          stage
        );

      selected.push(
        action ?? {
          ...fallbackAction(
            primaryFinding,
            stage
          ),

          findingTitle:
            primaryFinding.title,

          stage,
        }
      );
    }

    /*
     * Stage 5 is always MVP
     * definition.
     */

    const mvpAction =
      planned.find(
        (action) =>
          action.stage === 5
      );

    selected.push(
      mvpAction ?? {
        ...fallbackAction(
          primaryFinding,
          5
        ),

        findingTitle:
          primaryFinding.title,

        stage: 5,
      }
    );

    /*
     * =========================================
     * 9. SAVE FINDINGS
     * =========================================
     */

    for (
      const finding of
      verifiedFindings
    ) {
      await prisma.researchFinding.create(
        {
          data: {
            title:
              finding.title,

            description:
              finding.description,

            evidence:
              finding.evidence,

            sourceUrl:
              finding.sourceUrl,

            sourceName:
              finding.sourceName,

            opportunityScore:
              finding.opportunityScore,

            researchRunId:
              run.id,
          },
        }
      );
    }

    /*
     * =========================================
     * 10. SAVE MEMORY
     * =========================================
     */

    let memoriesCreated =
      0;

    for (
      const finding of
      verifiedFindings
    ) {
      const memoryContent =
        `Research finding: ${finding.title}. ` +
        `${finding.description} ` +
        `Evidence: ${finding.evidence} ` +
        `Source: ${finding.sourceName} ` +
        `(${finding.sourceUrl}) ` +
        `Opportunity score: ${finding.opportunityScore}/100.`;

      const existing =
        await prisma.memory.findFirst(
          {
            where: {
              projectId,

              content:
                memoryContent,
            },
          }
        );

      if (!existing) {
        await prisma.memory.create(
          {
            data: {
              content:
                memoryContent,

              projectId,
            },
          }
        );

        memoriesCreated++;
      }
    }

    /*
     * =========================================
     * 11. SAVE TASKS
     * =========================================
     */

    let tasksCreated =
      0;

    for (
      const action of
      selected
    ) {
      if (
        isBuildAction(
          action.title,
          action.description
        )
      ) {
        continue;
      }

      const existing =
        await prisma.task.findFirst(
          {
            where: {
              projectId,

              title:
                action.title,
            },
          }
        );

      if (existing) {
        continue;
      }

      await prisma.task.create(
        {
          data: {
            title:
              action.title,

            description:
              `${action.description}\n\n` +
              `Related problem: ${action.findingTitle}\n\n` +
              `Generated from source-verified research.`,

            status:
              "TODO",

            priority:
              action.priority,

            projectId,
          },
        }
      );

      tasksCreated++;
    }

    /*
     * =========================================
     * 12. REPORT
     * =========================================
     */

    const stageNames = {
      1: "CUSTOMER VALIDATION",
      2: "MARKET VALIDATION",
      3: "ECONOMIC VALIDATION",
      4: "PROBLEM VALIDATION",
      5: "MVP DEFINITION",
      6: "BUILD / IMPLEMENTATION",
    };

    const actionReport =
      selected
        .map(
          (action, index) =>
            `${index + 1}. [` +
            `${stageNames[action.stage]}` +
            `] ${action.title} ` +
            `[${action.priority}] — ` +
            `${action.description}`
        )
        .join("\n");

    const scoreReport =
      verifiedFindings
        .map(
          (finding) =>
            `${finding.title}: ${finding.opportunityScore}/100 ` +
            `(frequency ${finding.scores.frequency}, ` +
            `severity ${finding.scores.severity}, ` +
            `economic impact ${finding.scores.economicImpact}, ` +
            `evidence strength ${finding.scores.evidenceStrength}, ` +
            `payment potential ${finding.scores.paymentPotential})\n` +
            `Evidence: ${finding.evidence}\n` +
            `Source: ${finding.sourceName} — ${finding.sourceUrl}`
        )
        .join(
          "\n\n"
        );

    const report =
      `${analysis.report.trim()}\n\n` +
      `OPPORTUNITY SCORES\n\n` +
      `${scoreReport}\n\n` +
      `FIVE-STAGE VALIDATION PLAN\n\n` +
      `${actionReport}\n\n` +
      `QUALITY GATES\n\n` +
      `✓ Source verification\n` +
      `✓ Deterministic evidence extraction\n` +
      `✓ Semantic finding/evidence alignment\n` +
      `✓ Problem-vs-solution filtering\n` +
      `✓ Stage validation\n\n` +
      `DECISION GATE\n\n` +
      `Validate the problem before committing to an MVP or product build.`;

    /*
     * =========================================
     * 13. COMPLETE
     * =========================================
     */

    const completed =
      await prisma.researchRun.update(
        {
          where: {
            id: run.id,
          },

          data: {
            status:
              "COMPLETED",

            completedAt:
              new Date(),

            summary:
              analysis.summary.trim(),

            report,

            error:
              sourceRejectedCount >
                0 ||
              weakEvidenceCount >
                0 ||
              evidenceRejectedCount >
                0 ||
              semanticMismatchCount >
                0 ||
              solutionRejectedCount >
                0
                ? `${sourceRejectedCount} source-rejected; ${weakEvidenceCount} weak-evidence; ${evidenceRejectedCount} evidence-rejected; ${semanticMismatchCount} semantic mismatch; ${solutionRejectedCount} solution/problem rejected.`
                : "",
          },

          include: {
            findings: {
              orderBy: {
                opportunityScore:
                  "desc",
              },
            },
          },
        }
      );

    await prisma.researchJob.update(
      {
        where: {
          id: job.id,
        },

        data: {
          status:
            "COMPLETED",
        },
      }
    );

    return NextResponse.json({
      success: true,

      researchJob: {
        id: job.id,
        title:
          job.title,
        topic:
          job.topic,
      },

      run:
        completed,

      sourceCount:
        sources.length,

      rawFindingCount:
        analysis.findings
          .length,

      acceptedFindingCount:
        verifiedFindings
          .length,

      sourceRejectedCount,

      weakEvidenceCount,

      evidenceRejectedCount,

      semanticMismatchCount,

      solutionRejectedCount,

      memoriesCreated,

      tasksCreated,

      actionPlan:
        selected,

      opportunityScores:
        verifiedFindings.map(
          (finding) => ({
            title:
              finding.title,

            score:
              finding.opportunityScore,

            factors:
              finding.scores,

            evidence:
              finding.evidence,

            source: {
              name:
                finding.sourceName,

              url:
                finding.sourceUrl,
            },
          })
        ),
    });
  } catch (error) {
    console.error(
      "Research Runner Error:",
      error
    );

    if (runId !== null) {
      try {
        const failed =
          await prisma.researchRun.update(
            {
              where: {
                id: runId,
              },

              data: {
                status:
                  "FAILED",

                completedAt:
                  new Date(),

                error:
                  error instanceof Error
                    ? error.message
                    : "Unknown research error.",
              },
            }
          );

        await prisma.researchJob.update(
          {
            where: {
              id:
                failed.researchJobId,
            },

            data: {
              status:
                "FAILED",
            },
          }
        );
      } catch (updateError) {
        console.error(
          "Failed to update failed run:",
          updateError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Research run failed.",
      },
      {
        status: 500,
      }
    );
  }
}