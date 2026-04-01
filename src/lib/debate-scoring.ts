/**
 * Debate Quality Scoring Engine
 * Evaluates debate responses on multiple dimensions using a structured rubric.
 * Works with the existing Groq/Langfuse setup in contradict-me.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type DebateRole = 'pro' | 'con' | 'moderator';

export interface DebateArgument {
  id: string;
  userId?: string;
  role: DebateRole;
  content: string;
  timestamp: number;
  replyToId?: string;
}

export interface ArgumentScore {
  argumentId: string;
  /** 0–10: Logic and reasoning quality */
  logic: number;
  /** 0–10: Quality of evidence cited */
  evidence: number;
  /** 0–10: Relevance to the debate topic */
  relevance: number;
  /** 0–10: Rhetorical effectiveness */
  rhetoric: number;
  /** 0–10: Addressing opponent's points */
  rebuttal: number;
  /** Weighted composite 0–100 */
  total: number;
  /** Brief AI-generated feedback */
  feedback: string;
  /** Detected fallacies if any */
  fallacies: string[];
}

export interface DebateResult {
  topic: string;
  scores: ArgumentScore[];
  winner: 'pro' | 'con' | 'draw';
  summary: string;
  topArguments: { pro: string; con: string };
}

// ─── Scoring Weights ──────────────────────────────────────────────────────────

const WEIGHTS = {
  logic: 0.3,
  evidence: 0.25,
  relevance: 0.2,
  rhetoric: 0.15,
  rebuttal: 0.1,
};

function computeTotal(
  scores: Omit<ArgumentScore, 'argumentId' | 'total' | 'feedback' | 'fallacies'>
): number {
  return Math.round(
    (scores.logic * WEIGHTS.logic +
      scores.evidence * WEIGHTS.evidence +
      scores.relevance * WEIGHTS.relevance +
      scores.rhetoric * WEIGHTS.rhetoric +
      scores.rebuttal * WEIGHTS.rebuttal) *
      10
  );
}

// ─── Fallacy Detection ────────────────────────────────────────────────────────

const FALLACY_PATTERNS: Array<{ name: string; patterns: RegExp[] }> = [
  {
    name: 'Ad Hominem',
    patterns: [/you are|you're (stupid|wrong|ignorant|lying)/i, /personal attack/i],
  },
  {
    name: 'Straw Man',
    patterns: [/you're saying that|you claimed that|so you think/i],
  },
  {
    name: 'False Dichotomy',
    patterns: [/either .+ or .+/i, /only two options/i, /you're either with us/i],
  },
  {
    name: 'Appeal to Authority',
    patterns: [/experts say|scientists agree|everyone knows/i],
  },
  {
    name: 'Slippery Slope',
    patterns: [/next thing you know|this will lead to|eventually this means/i],
  },
  {
    name: 'Circular Reasoning',
    patterns: [/because it is|by definition|obviously true/i],
  },
];

export function detectFallacies(text: string): string[] {
  return FALLACY_PATTERNS.filter((f) => f.patterns.some((p) => p.test(text))).map((f) => f.name);
}

// ─── Heuristic Scoring ────────────────────────────────────────────────────────

/**
 * Score an argument heuristically (no AI call required).
 * For AI-powered scoring, use scoreArgumentWithAI.
 */
export function scoreArgumentHeuristic(
  argument: DebateArgument,
  topic: string,
  opponentArguments: DebateArgument[] = []
): ArgumentScore {
  const text = argument.content;
  const wordCount = text.split(/\s+/).length;

  // Logic: reward structured sentences, penalise very short/long
  const logic = Math.min(
    10,
    Math.max(
      1,
      5 +
        (wordCount > 50 ? 2 : 0) +
        (text.includes('because') ? 1 : 0) +
        (text.includes('therefore') ? 1 : 0)
    )
  );

  // Evidence: reward citations, stats, examples
  const evidenceBonus =
    (text.match(/\d+%|\d+ (studies|research|data|source)/i) ? 3 : 0) +
    (text.match(/according to|cited|published|study|research/i) ? 2 : 0);
  const evidence = Math.min(10, Math.max(1, 3 + evidenceBonus));

  // Relevance: simple keyword overlap with topic
  const topicWords = new Set(topic.toLowerCase().split(/\s+/));
  const textWords = new Set(text.toLowerCase().split(/\s+/));
  const overlap = [...topicWords].filter((w) => textWords.has(w)).length;
  const relevance = Math.min(10, Math.max(1, 4 + overlap * 2));

  // Rhetoric: sentence variety, persuasive language
  const rhetoric = Math.min(
    10,
    Math.max(
      1,
      4 +
        (text.match(/imagine|consider|clearly|undeniably|importantly/i) ? 2 : 0) +
        (text.match(/\?/) ? 1 : 0)
    )
  );

  // Rebuttal: does this address any opponent argument?
  const rebuttalScore = opponentArguments.some((opp) => {
    const oppWords = new Set(opp.content.toLowerCase().split(/\s+/));
    const shared = [...oppWords].filter((w) => textWords.has(w)).length;
    return shared > 5;
  })
    ? 7
    : 3;
  const rebuttal = Math.min(10, rebuttalScore);

  const scores = { logic, evidence, relevance, rhetoric, rebuttal };
  const fallacies = detectFallacies(text);

  return {
    argumentId: argument.id,
    ...scores,
    total: computeTotal(scores),
    fallacies,
    feedback: generateHeuristicFeedback(scores, fallacies, wordCount),
  };
}

function generateHeuristicFeedback(
  scores: Record<string, number>,
  fallacies: string[],
  wordCount: number
): string {
  const parts: string[] = [];

  if (scores.evidence < 4) parts.push('Add specific evidence or data to strengthen your case.');
  if (scores.logic < 4) parts.push('Develop a clearer chain of reasoning.');
  if (scores.rebuttal < 4) parts.push("Directly address your opponent's core points.");
  if (fallacies.length > 0) parts.push(`Watch for logical fallacies: ${fallacies.join(', ')}.`);
  if (wordCount < 30) parts.push('Develop your argument more fully.');
  if (wordCount > 500) parts.push('Tighten your argument — be more concise.');
  if (parts.length === 0) parts.push('Well-structured argument.');

  return parts.join(' ');
}

// ─── Debate Aggregation ───────────────────────────────────────────────────────

/**
 * Compute overall debate result from individual argument scores.
 */
export function aggregateDebateResult(
  topic: string,
  proArgs: DebateArgument[],
  conArgs: DebateArgument[]
): DebateResult {
  const proScores = proArgs.map((a) => scoreArgumentHeuristic(a, topic, conArgs));
  const conScores = conArgs.map((a) => scoreArgumentHeuristic(a, topic, proArgs));

  const proAvg = proScores.length
    ? proScores.reduce((s, a) => s + a.total, 0) / proScores.length
    : 0;
  const conAvg = conScores.length
    ? conScores.reduce((s, a) => s + a.total, 0) / conScores.length
    : 0;

  const winner: 'pro' | 'con' | 'draw' =
    Math.abs(proAvg - conAvg) < 5 ? 'draw' : proAvg > conAvg ? 'pro' : 'con';

  const bestPro = proScores.sort((a, b) => b.total - a.total)[0];
  const bestCon = conScores.sort((a, b) => b.total - a.total)[0];

  return {
    topic,
    scores: [...proScores, ...conScores],
    winner,
    summary: `${winner === 'draw' ? 'The debate was evenly matched' : `The ${winner} side argued more effectively`}. Pro avg: ${proAvg.toFixed(1)}, Con avg: ${conAvg.toFixed(1)}.`,
    topArguments: {
      pro: proArgs.find((a) => a.id === bestPro?.argumentId)?.content.slice(0, 200) ?? '',
      con: conArgs.find((a) => a.id === bestCon?.argumentId)?.content.slice(0, 200) ?? '',
    },
  };
}
