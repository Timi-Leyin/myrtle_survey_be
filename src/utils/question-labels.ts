/**
 * Question Labels
 * Maps question answers to human-readable labels
 */

export const QUESTION_LABELS = {
  Q1: {
    A: "Below ₦5m",
    B: "₦5m–₦20m",
    C: "₦20m–₦40m",
    D: "₦40m–₦100m",
    E: "₦100m–₦500m",
    F: "Above ₦500m",
  },
  Q2: {
    STG1: "Building stability",
    STG2: "Growing income / expanding career or business",
    STG3: "Preparing long-term financial plans",
    STG4: "Wealth expansion & asset consolidation",
    STG5: "Preparing for legacy transfer / succession",
    STG6: "Managing multi-generational wealth",
  },
  Q3: {
    A: "Short-term (0–12 months)",
    B: "Medium-term (1–3 years)",
    C: "Long-term (3–5 years)",
    D: "Very long-term (5+ years)",
  },
  Q4: {
    A: "Below ₦5m",
    B: "₦5m–₦50m",
    C: "₦50m–₦250m",
    D: "₦250m–₦1bn",
    E: "Above ₦1bn",
  },
  Q5: {
    A: "None",
    B: "Below ₦50m",
    C: "₦50m–₦250m",
    D: "₦250m–₦1bn",
    E: "Above ₦1bn",
  },
  Q6: {
    A: "None",
    B: "Below ₦50m",
    C: "₦50m–₦250m",
    D: "₦250m–₦1bn",
    E: "Above ₦1bn",
  },
  Q7: {
    A: "None",
    B: "Below ₦25m",
    C: "₦25m–₦100m",
    D: "₦100m–₦500m",
    E: "Above ₦500m",
  },
  Q8: {
    T1: "Capital preservation / safety",
    T2: "Steady income",
    T3: "Medium-term growth",
    T4: "Long-term aggressive growth",
    T5: "Legacy building",
    T6: "FX protection / currency diversification",
    T7: "Wealth transfer & continuity",
  },
  Q9: {
    A: "Buy more",
    B: "Stay invested",
    C: "Reduce exposure",
    D: "Exit immediately",
  },
  Q10: {
    A: "Very comfortable",
    B: "Moderate",
    C: "Slightly uncomfortable",
    D: "Not comfortable at all",
  },
  Q11: {
    A: "0% (No loss)",
    B: "Up to 5%",
    C: "Up to 10%",
    D: "Above 10%",
  },
  Q12: {
    A: "Limited buffer — I may need liquidity often",
    B: "Moderate buffer — I can stay invested",
    C: "Strong buffer — little need for liquidity",
    D: "Very strong buffer — I invest for the long game",
  },
  Q13: {
    A: "None",
    B: "Beginner",
    C: "Moderate",
    D: "Experienced",
  },
  Q14: {
    A: "Very high liquidity (may need access anytime)",
    B: "Moderate liquidity (6–12 months)",
    C: "Low liquidity (1–3 years)",
    D: "No liquidity need (3+ years)",
  },
  Q15: {
    SRC1: "Salary / Employment Income",
    SRC2: "Business Income",
    SRC3: "Rental Income",
    SRC4: "Investment Income (Dividends, Interest)",
    SRC5: "Asset Sale",
    SRC6: "Family Support / Gifts",
    SRC7: "Diaspora Remittance",
    SRC8: "Others",
  },
} as const;

export function getQuestionLabel(question: string, answer: string | string[]): string {
  const labels = QUESTION_LABELS[question as keyof typeof QUESTION_LABELS];
  if (!labels) return Array.isArray(answer) ? answer.join(", ") : answer;
  
  // Handle array of answers (multi-select)
  if (Array.isArray(answer)) {
    return answer
      .map((ans) => labels[ans as keyof typeof labels] || ans)
      .join(", ");
  }
  
  // Handle single answer
  return labels[answer as keyof typeof labels] || answer;
}

export const PERSONA_NARRATIVES = {
  "Everyday Builder":
    "building a solid foundation with disciplined savings, smart budgeting, and strategic investments that grow steadily over time.",
  "Strategic Achiever":
    "actively expanding your wealth through diversified investments, income growth strategies, and long-term financial planning.",
  "Private Wealth Niche":
    "managing significant assets with a focus on preservation, tax efficiency, legacy planning, and intergenerational wealth transfer.",
} as const;

export function getPersonaNarrative(persona: string): string {
  return (
    PERSONA_NARRATIVES[persona as keyof typeof PERSONA_NARRATIVES] ||
    "on a journey to build and preserve wealth through strategic financial planning."
  );
}

