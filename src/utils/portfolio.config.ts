/**
 * Portfolio Configuration
 * Generates recommended portfolio allocation based on persona and risk profile
 */

import { Persona } from "./persona.config";
import { RiskProfile } from "./risk.config";

export interface PortfolioAllocation {
  cash?: number;
  income?: number;
  growth?: number;
  fx?: number;
  alternatives?: number;
  custom?: boolean;
}

/**
 * Get recommended portfolio allocation
 */
export function getRecommendedPortfolio(
  persona: Persona,
  riskProfile: RiskProfile
): PortfolioAllocation {
  // Everyday Builder + Moderate
  if (persona === "Everyday Builder" && riskProfile === "Moderate") {
    return {
      cash: 60,
      income: 30,
      growth: 10,
    };
  }

  // Strategic Achiever + Growth
  if (persona === "Strategic Achiever" && riskProfile === "Growth") {
    return {
      cash: 15,
      income: 35,
      growth: 30,
      fx: 20,
    };
  }

  // Private Wealth + Aggressive
  if (persona === "Private Wealth Niche" && riskProfile === "Aggressive") {
    return {
      cash: 10,
      income: 25,
      growth: 30,
      fx: 25,
      alternatives: 10,
    };
  }

  // Fallback: return custom flag
  return {
    custom: true,
  };
}

/**
 * Format portfolio for display
 */
export function formatPortfolioSummary(portfolio: PortfolioAllocation): string {
  if (portfolio.custom) {
    return "Custom allocation based on your unique profile";
  }

  const parts: string[] = [];
  if (portfolio.cash) parts.push(`${portfolio.cash}% Cash`);
  if (portfolio.income) parts.push(`${portfolio.income}% Income`);
  if (portfolio.growth) parts.push(`${portfolio.growth}% Growth`);
  if (portfolio.fx) parts.push(`${portfolio.fx}% FX`);
  if (portfolio.alternatives) parts.push(`${portfolio.alternatives}% Alternatives`);

  return parts.join(", ");
}

