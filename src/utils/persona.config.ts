/**
 * Persona Configuration
 * Determines user persona based on net worth band, income, stage, and time horizon
 */

import { NetWorthBand } from "./networth.config";

export type Persona = "Private Wealth Niche" | "Strategic Achiever" | "Everyday Builder";

/**
 * Determine persona based on updated rules:
 * 
 * Q1: Annual income (INC1-INC6: A-F)
 * Q2: Financial stage (multi-select: STG1-STG6)
 * Q3: Investment horizon (T1-T4: A-D)
 * 
 * Private Wealth Niche IF:
 *   - NW4 (Private Wealth net worth band) OR
 *   - NW3 (Affluent) AND (has STG4/STG5/STG6 in Q2) OR
 *   - Q1 = E or F (income ₦100m+) AND (has STG4/STG5/STG6 in Q2)
 * 
 * Strategic Achiever IF:
 *   - NOT Private Wealth Niche AND
 *   - (NW2 or NW3) AND
 *   - Q1 = B/C/D/E/F (income ₦5m+) AND
 *   - (has STG2/STG3/STG4 in Q2) AND
 *   - Q3 = B/C/D (investment horizon 1+ years)
 * 
 * Else:
 *   - Everyday Builder
 */
export function determinePersona(
  netWorthBand: NetWorthBand,
  answers: Record<string, string | string[]>
): Persona {
  const isNW4 = netWorthBand === "NW4";
  const isNW3 = netWorthBand === "NW3";
  const isNW2 = netWorthBand === "NW2";

  const q1Income = answers.Q1 as string;
  const q2Stage = answers.Q2; // Can be array or string
  const q3Horizon = answers.Q3 as string;

  // Helper to check if Q2 includes any of the specified stages
  const hasStage = (...stages: string[]) => {
    if (Array.isArray(q2Stage)) {
      return q2Stage.some((stage) => stages.includes(stage));
    }
    return stages.includes(q2Stage as string);
  };

  // Check for Private Wealth Niche
  if (isNW4) {
    return "Private Wealth Niche";
  }

  if (isNW3 && hasStage("STG4", "STG5", "STG6")) {
    return "Private Wealth Niche";
  }

  if ((q1Income === "E" || q1Income === "F") && hasStage("STG4", "STG5", "STG6")) {
    return "Private Wealth Niche";
  }

  // Check for Strategic Achiever
  if ((isNW2 || isNW3)) {
    const hasQualifyingIncome = ["B", "C", "D", "E", "F"].includes(q1Income);
    const hasQualifyingStage = hasStage("STG2", "STG3", "STG4");
    const hasQualifyingHorizon = ["B", "C", "D"].includes(q3Horizon);

    if (hasQualifyingIncome && hasQualifyingStage && hasQualifyingHorizon) {
      return "Strategic Achiever";
    }
  }

  // Default to Everyday Builder
  return "Everyday Builder";
}

