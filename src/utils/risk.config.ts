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
 * Risk scoring rules:
 * HIGH→LOW (A=4, B=3, C=2, D=1): Q8, Q9, Q10
 * LOW→HIGH (A=1, B=2, C=3, D=4): Q11, Q12, Q13, Q14
 */
const HIGH_TO_LOW_QUESTIONS = ["Q8", "Q9", "Q10"];
const LOW_TO_HIGH_QUESTIONS = ["Q11", "Q12", "Q13", "Q14"];

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
export function calculateRiskScore(answers: Record<string, string>): RiskScoreResult {
  let totalScore = 0;

  // Process HIGH→LOW questions
  for (const question of HIGH_TO_LOW_QUESTIONS) {
    const answer = answers[question];
    if (answer && HIGH_TO_LOW_SCORES[answer]) {
      totalScore += HIGH_TO_LOW_SCORES[answer];
    }
  }

  // Process LOW→HIGH questions
  for (const question of LOW_TO_HIGH_QUESTIONS) {
    const answer = answers[question];
    if (answer && LOW_TO_HIGH_SCORES[answer]) {
      totalScore += LOW_TO_HIGH_SCORES[answer];
    }
  }

  // Determine risk profile
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

