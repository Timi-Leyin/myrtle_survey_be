/**
 * Persona Configuration
 * Determines user persona based on net worth band, income, stage, and time horizon
 */

import { NetWorthBand } from "./networth.config";

export type Persona = "Private Wealth Niche" | "Strategic Achiever" | "Everyday Builder";

/**
 * Determine persona based on rules:
 * 
 * Private Wealth Niche IF:
 *   NW4 OR (NW3 AND STG3/STG4) OR (INC4 AND STG3/STG4)
 * 
 * Strategic Achiever IF:
 *   NOT PWN AND
 *   NW2/NW3 AND INC2–INC4 AND STG2/3 AND T2–T4
 * 
 * Else:
 *   Everyday Builder
 * 
 * Note: Q1-Q3 are assumed to map to income/stage/time categories
 * This implementation uses heuristics based on answer patterns
 */
export function determinePersona(
  netWorthBand: NetWorthBand,
  answers: Record<string, string>
): Persona {
  const isNW4 = netWorthBand === "NW4";
  const isNW3 = netWorthBand === "NW3";
  const isNW2 = netWorthBand === "NW2";

  // Helper to determine if answer indicates higher tier (C or D)
  const isHigherTier = (q: string) => {
    const ans = answers[q];
    return ans === "C" || ans === "D";
  };

  // Helper to determine if answer indicates mid-high tier (B, C, or D)
  const isMidHighTier = (q: string) => {
    const ans = answers[q];
    return ans === "B" || ans === "C" || ans === "D";
  };

  // Check for Private Wealth Niche
  // NW4 OR (NW3 AND (Q1=STG3/STG4 OR Q2=STG3/STG4)) OR (Q3=INC4 AND (Q1=STG3/STG4 OR Q2=STG3/STG4))
  if (isNW4) {
    return "Private Wealth Niche";
  }

  // Check if NW3 with higher tier answers (assuming Q1-Q3 relate to stage/income)
  if (isNW3 && (isHigherTier("Q1") || isHigherTier("Q2") || isHigherTier("Q3"))) {
    return "Private Wealth Niche";
  }

  // Check for Strategic Achiever
  // NOT PWN AND NW2/NW3 AND (Q1-Q3 indicate mid-high tiers)
  if ((isNW2 || isNW3)) {
    // Check if Q1-Q3 indicate mid-high income/stage/time (B, C, or D)
    const hasMidHighIndicators = 
      isMidHighTier("Q1") && 
      isMidHighTier("Q2") && 
      isMidHighTier("Q3");
    
    if (hasMidHighIndicators) {
      return "Strategic Achiever";
    }
  }

  // Default to Everyday Builder
  return "Everyday Builder";
}

