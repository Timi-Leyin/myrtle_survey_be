/**
 * Net Worth Configuration
 * Maps question answers to midpoint values and calculates net worth bands
 */

export const NETWORTH_MIDPOINTS = {
  Q4: {
    A: 2_500_000,       // Below ₦5m → 2.5m
    B: 27_500_000,      // ₦5m–₦50m → 27.5m
    C: 150_000_000,     // ₦50m–₦250m → 150m
    D: 625_000_000,     // ₦250m–₦1bn → 625m
    E: 1_250_000_000,   // Above ₦1bn → 1.25bn
  },
  Q5: {
    A: 0,               // None
    B: 25_000_000,      // Below ₦50m → 25m
    C: 150_000_000,     // ₦50m–₦250m → 150m
    D: 625_000_000,     // ₦250m–₦1bn → 625m
    E: 1_250_000_000,   // Above ₦1bn → 1.25bn
  },
  Q6: {
    A: 0,               // None
    B: 25_000_000,      // Below ₦50m → 25m
    C: 150_000_000,     // ₦50m–₦250m → 150m
    D: 625_000_000,     // ₦250m–₦1bn → 625m
    E: 1_250_000_000,   // Above ₦1bn → 1.25bn
  },
  Q7: {
    A: 0,               // None
    B: 12_500_000,      // Below ₦25m → 12.5m
    C: 62_500_000,      // ₦25m–₦100m → 62.5m
    D: 300_000_000,     // ₦100m–₦500m → 300m
    E: 750_000_000,     // Above ₦500m → 750m
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
export function calculateNetWorth(answers: Record<string, string | string[]>): number {
  const q4Key = Array.isArray(answers.Q4) ? undefined : (answers.Q4 as keyof typeof NETWORTH_MIDPOINTS.Q4);
  const q5Key = Array.isArray(answers.Q5) ? undefined : (answers.Q5 as keyof typeof NETWORTH_MIDPOINTS.Q5);
  const q6Key = Array.isArray(answers.Q6) ? undefined : (answers.Q6 as keyof typeof NETWORTH_MIDPOINTS.Q6);
  const q7Key = Array.isArray(answers.Q7) ? undefined : (answers.Q7 as keyof typeof NETWORTH_MIDPOINTS.Q7);

  const q4 = q4Key ? NETWORTH_MIDPOINTS.Q4[q4Key] : 0;
  const q5 = q5Key ? NETWORTH_MIDPOINTS.Q5[q5Key] : 0;
  const q6 = q6Key ? NETWORTH_MIDPOINTS.Q6[q6Key] : 0;
  const q7 = q7Key ? NETWORTH_MIDPOINTS.Q7[q7Key] : 0;

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

