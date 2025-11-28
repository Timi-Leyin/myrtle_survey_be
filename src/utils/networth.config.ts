/**
 * Net Worth Configuration
 * Maps question answers to midpoint values and calculates net worth bands
 */

export const NETWORTH_MIDPOINTS = {
  Q4: {
    A: 2_500_000,   // 2.5m
    B: 27_500_000,  // 27.5m
    C: 75_000_000,  // 75m
    D: 300_000_000, // 300m
  },
  Q5: {
    A: 0,
    B: 12_500_000,  // 12.5m
    C: 137_500_000, // 137.5m
    D: 375_000_000, // 375m
  },
  Q6: {
    A: 0,
    B: 12_500_000,  // 12.5m
    C: 137_500_000, // 137.5m
    D: 375_000_000, // 375m
  },
  Q7: {
    A: 0,
    B: 12_500_000,  // 12.5m
    C: 137_500_000, // 137.5m
    D: 375_000_000, // 375m
  },
} as const;

export type NetWorthBand = "NW1" | "NW2" | "NW3" | "NW4";

export interface NetWorthBandInfo {
  code: NetWorthBand;
  label: string;
  min: number;
  max: number | null;
}

export const NETWORTH_BANDS: NetWorthBandInfo[] = [
  {
    code: "NW1",
    label: "Emerging",
    min: 0,
    max: 20_000_000,
  },
  {
    code: "NW2",
    label: "Mass Affluent",
    min: 20_000_000,
    max: 100_000_000,
  },
  {
    code: "NW3",
    label: "Affluent",
    min: 100_000_000,
    max: 250_000_000,
  },
  {
    code: "NW4",
    label: "Private Wealth",
    min: 250_000_000,
    max: null,
  },
];

/**
 * Calculate net worth from question answers
 */
export function calculateNetWorth(answers: Record<string, string>): number {
  const q4 = NETWORTH_MIDPOINTS.Q4[answers.Q4 as keyof typeof NETWORTH_MIDPOINTS.Q4] || 0;
  const q5 = NETWORTH_MIDPOINTS.Q5[answers.Q5 as keyof typeof NETWORTH_MIDPOINTS.Q5] || 0;
  const q6 = NETWORTH_MIDPOINTS.Q6[answers.Q6 as keyof typeof NETWORTH_MIDPOINTS.Q6] || 0;
  const q7 = NETWORTH_MIDPOINTS.Q7[answers.Q7 as keyof typeof NETWORTH_MIDPOINTS.Q7] || 0;

  return (q4 + q5 + q6) - q7;
}

/**
 * Determine net worth band from net worth value
 */
export function getNetWorthBand(netWorth: number): NetWorthBandInfo {
  for (const band of NETWORTH_BANDS) {
    if (band.max === null) {
      if (netWorth >= band.min) {
        return band;
      }
    } else {
      if (netWorth >= band.min && netWorth < band.max) {
        return band;
      }
    }
  }
  
  // Default to NW1 if somehow no band matches
  return NETWORTH_BANDS[0];
}

