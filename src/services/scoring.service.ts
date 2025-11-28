/**
 * Scoring Service
 * Orchestrates all scoring calculations
 */

import { calculateNetWorth, getNetWorthBand } from "../utils/networth.config";
import { calculateRiskScore } from "../utils/risk.config";
import { determinePersona } from "../utils/persona.config";
import { getRecommendedPortfolio } from "../utils/portfolio.config";

export interface ScoringResult {
  netWorth: number;
  netWorthBand: string;
  riskScore: number;
  riskProfile: string;
  persona: string;
  portfolio: Record<string, any>;
}

/**
 * Calculate all scores from questionnaire answers
 */
export function calculateScores(answers: Record<string, string>): ScoringResult {
  // Calculate net worth
  const netWorth = calculateNetWorth(answers);
  const netWorthBandInfo = getNetWorthBand(netWorth);
  const netWorthBand = `${netWorthBandInfo.code}-${netWorthBandInfo.label}`;

  // Calculate risk score and profile
  const riskResult = calculateRiskScore(answers);

  // Determine persona
  const persona = determinePersona(netWorthBandInfo.code, answers);

  // Get recommended portfolio
  const portfolio = getRecommendedPortfolio(persona as any, riskResult.profile);

  return {
    netWorth,
    netWorthBand,
    riskScore: riskResult.score,
    riskProfile: riskResult.profile,
    persona,
    portfolio,
  };
}

