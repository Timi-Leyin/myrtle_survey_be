/**
 * Risk Configuration
 * Maps question answers to risk scores and determines risk profile
 */

export type RiskProfile = "Conservative" | "Moderate" | "Growth" | "Aggressive";

export interface RiskScoreResult {
  score: number;
  profile: RiskProfile;
}

/**
 * Risk scoring rules for new questionnaire:
 * Q8: Multi-select investment goals (highest score counts)
 * Q9: Market drop reaction (HIGH→LOW: A=4, B=3, C=2, D=1)
 * Q10: Comfort with fluctuations (HIGH→LOW: A=4, B=3, C=2, D=1)
 * Q11: Loss tolerance (LOW→HIGH: A=1, B=2, C=3, D=4)
 * Q12: Financial buffer (LOW→HIGH: A=1, B=2, C=3, D=4)
 * Q13: Investment experience (LOW→HIGH: A=1, B=2, C=3, D=4)
 * Q14: Liquidity requirement (LOW→HIGH: A=1, B=2, C=3, D=4)
 */

const Q8_SCORES: Record<string, number> = {
  T1: 1, // Capital preservation / safety
  T2: 2, // Steady income
  T3: 3, // Medium-term growth
  T4: 4, // Long-term aggressive growth
  T5: 3, // Legacy building
  T6: 3, // FX protection / currency diversification
  T7: 2, // Wealth transfer & continuity
};

const HIGH_TO_LOW_SCORES: Record<string, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
};

const LOW_TO_HIGH_SCORES: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
};

/**
 * Calculate risk score from question answers
 */
export function calculateRiskScore(answers: Record<string, string | string[]>): RiskScoreResult {
  let totalScore = 0;

  // Q8: Investment goals (multi-select) - take the highest risk score from selected goals
  const q8Answer = answers.Q8;
  if (q8Answer) {
    const q8Scores = Array.isArray(q8Answer)
      ? q8Answer.map((goal) => Q8_SCORES[goal] || 0)
      : [Q8_SCORES[q8Answer as string] || 0];
    totalScore += Math.max(...q8Scores, 0);
  }

  // Q9: Market drop reaction (HIGH→LOW)
  const q9Answer = answers.Q9;
  if (q9Answer && typeof q9Answer === "string") {
    totalScore += HIGH_TO_LOW_SCORES[q9Answer] || 0;
  }

  // Q10: Comfort with fluctuations (HIGH→LOW)
  const q10Answer = answers.Q10;
  if (q10Answer && typeof q10Answer === "string") {
    totalScore += HIGH_TO_LOW_SCORES[q10Answer] || 0;
  }

  // Q11: Loss tolerance (LOW→HIGH)
  const q11Answer = answers.Q11;
  if (q11Answer && typeof q11Answer === "string") {
    totalScore += LOW_TO_HIGH_SCORES[q11Answer] || 0;
  }

  // Q12: Financial buffer (LOW→HIGH)
  const q12Answer = answers.Q12;
  if (q12Answer && typeof q12Answer === "string") {
    totalScore += LOW_TO_HIGH_SCORES[q12Answer] || 0;
  }

  // Q13: Investment experience (LOW→HIGH)
  const q13Answer = answers.Q13;
  if (q13Answer && typeof q13Answer === "string") {
    totalScore += LOW_TO_HIGH_SCORES[q13Answer] || 0;
  }

  // Q14: Liquidity requirement (LOW→HIGH)
  const q14Answer = answers.Q14;
  if (q14Answer && typeof q14Answer === "string") {
    totalScore += LOW_TO_HIGH_SCORES[q14Answer] || 0;
  }

  // Determine risk profile (max score: 28)
  let profile: RiskProfile;
  if (totalScore <= 12) {
    profile = "Conservative";
  } else if (totalScore >= 13 && totalScore <= 18) {
    profile = "Moderate";
  } else if (totalScore >= 19 && totalScore <= 23) {
    profile = "Growth";
  } else {
    profile = "Aggressive";
  }

  return {
    score: totalScore,
    profile,
  };
}

