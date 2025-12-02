/**
 * Narrative Service
 * Generates personalized wealth blueprint narrative
 */

import { formatNumber } from "../utils/helpers";
import { formatPortfolioSummary } from "../utils/portfolio.config";
import { PortfolioAllocation } from "../utils/portfolio.config";
import { getPersonaNarrative } from "../utils/question-labels";

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
  const personaNarrative = getPersonaNarrative(persona);
  const netWorthBandLabel = netWorthBand.split("-")[1] || netWorthBand;

  return `🌿 MYRTLE WEALTH BLUEPRINT™
— Personalized Client Narrative

Reimagining Wealth. Building Prosperity Together.

1. Your Financial Identity — Who You Are Today

Based on the information you shared, you fall into the ${persona} segment.

What this means in simple language:
${personaNarrative}

This gives us clarity on how best to serve you and which financial solutions will create the most meaningful impact.

2. Your Net Worth Position — A Clear Picture

After consolidating everything, your Estimated Net Worth is:
₦${formatNumber(netWorth)}

This places you in the ${netWorthBandLabel} category.

What this means:
• Emerging: You are in the early asset-building stage
• Mass Affluent: You have a growing financial base and expanding opportunities
• Affluent: You have established assets and require structured growth and protection
• Private Wealth: You are at wealth-preservation, governance, and succession planning levels

This helps us determine the level of sophistication, diversification, and long-term structuring your plan deserves.

3. Your Investment Personality — Your Comfort With Risk

Your Risk Profile is: ${riskProfile}

What this means:
• Conservative: You value capital protection and stability above growth
• Moderate: You balance safety with steady returns
• Growth: You are comfortable with calculated swings for higher long-term gains
• Aggressive: You seek strong long-term growth and are comfortable with volatility

Your Risk Score was ${riskScore}/28, which tells us how you naturally make money decisions — steady, bold, cautious, or growth-minded.

This ensures your investments match your personality, not your pressure.

4. What We Recommend for You — The Myrtle Pathway

Using your Persona + Risk Profile + Net Worth, your recommended investment path is:

Recommended Product Set
${portfolioSummary}

This may include:
• Money Market (Capital Preservation & Liquidity): Myrtle Nest (MyNest Money Market Fund)
• Fixed Income (Steady Income): Myrtle Fixed Income Plus, Myrtle Treasury Notes
• Balanced Growth: Myrtle Balanced Plus Fund, Myrtle WealthBlend
• FX Protection (USD Exposure): Myrtle Dollar Shield Fund

Each recommendation aligns with your goals, your time horizon, your personality, and your financial reality.

5. Your Wealth Story Going Forward

Across all categories — income, net worth, behaviour, goals, and values — your blueprint shows that you are ${personaNarrative}

Your next step is simple:
We help you structure your money to support the life you're building — one that is confident, intentional, and aligned with your long-term aspirations.

At Myrtle, our promise is to walk with you — with clarity, structure, dignity, and care.

🌿 Your Myrtle Advisor Will Now…
✓ Validate your details
✓ Confirm product selection
✓ Prepare your onboarding documents
✓ Build your personalized portfolio
✓ Set up your review cycle
✓ Walk you through each step in plain, human, relatable language

We look forward to being a meaningful partner on your wealth journey.`;
}

