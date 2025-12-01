/**
 * Question Labels
 * Maps question answers to human-readable labels
 */

export const QUESTION_LABELS = {
  Q8: {
    A: "Safety and liquidity",
    B: "Steady growth",
    C: "Aggressive long-term growth",
    D: "Legacy building",
  },
  Q9: {
    A: "Buy more",
    B: "Stay invested",
    C: "Reduce exposure",
    D: "Exit immediately",
  },
  Q10: {
    A: "Very comfortable",
    B: "Moderately comfortable",
    C: "Slightly uncomfortable",
    D: "Not comfortable at all",
  },
  Q14: {
    A: "Anytime",
    B: "Within 6 months",
    C: "1–3 years",
    D: "No immediate need",
  },
} as const;

export function getQuestionLabel(question: string, answer: string): string {
  const labels = QUESTION_LABELS[question as keyof typeof QUESTION_LABELS];
  if (!labels) return answer;
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

