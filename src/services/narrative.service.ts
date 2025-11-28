/**
 * Narrative Service
 * Generates personalized wealth blueprint narrative
 */

import { formatNumber } from "../utils/helpers";
import { formatPortfolioSummary } from "../utils/portfolio.config";
import { PortfolioAllocation } from "../utils/portfolio.config";

export interface NarrativeData {
  persona: string;
  netWorth: number;
  netWorthBand: string;
  riskScore: number;
  riskProfile: string;
  portfolio: PortfolioAllocation;
}

/**
 * Generate wealth blueprint narrative
 */
export function generateNarrative(data: NarrativeData): string {
  const { persona, netWorth, netWorthBand, riskScore, riskProfile, portfolio } = data;

  const portfolioSummary = formatPortfolioSummary(portfolio);

  return `MYRTLE WEALTH BLUEPRINT - Personalized Report

1. Financial Identity
You are classified as: ${persona}

2. Net Worth Summary
Your estimated net worth is NGN ${formatNumber(netWorth)} placing you in the ${netWorthBand} category.

3. Investment Personality
You are a ${riskProfile} investor with a score of ${riskScore}/28.

4. Recommended Pathway
Suggested Allocation:
${portfolioSummary}

5. Wealth Story Going Forward
We help you build a confident, structured, long-term financial future with Myrtle.`;
}

