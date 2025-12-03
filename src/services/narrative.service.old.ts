/**
 * Narrative Service
 * Generates personalized wealth blueprint narrative based on template structure
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
  // Optional extended fields
  cash_mid?: number;
  real_estate_mid?: number;
  business_mid?: number;
  debt_mid?: number;
  goals_selected_list?: string;
  sources_of_funds_list?: string;
  client_message?: string;
  reaction_dips?: string;
  volatility_comfort?: string;
  liquidity_need?: string;
}

// Template-based classification mappings
const PERSONA_MEANINGS: Record<string, string> = {
  EVERYDAY_BUILDER: "You are establishing your financial foundation — building stability, developing strong money habits, and creating the structures that support long-term confidence.",
  STRATEGIC_ACHIEVER: "You are actively expanding your wealth through diversified investments, income growth strategies, and forward-looking financial planning.",
  PRIVATE_WEALTH_NICHE: "You oversee significant assets and decisions. Your priority is wealth preservation, strategic growth, governance, and multi-generational continuity."
};

const NET_WORTH_BANDS: Record<string, { label: string; meaning: string }> = {
  "NW1-Emerging": { 
    label: "Emerging", 
    meaning: "You are in the early wealth-building phase. Your current structure focuses on stability and growth foundations." 
  },
  "NW2-Mass Affluent": { 
    label: "Mass Affluent", 
    meaning: "You have a growing financial base and expanding opportunities. With structure, your net worth can scale rapidly." 
  },
  "NW3-Affluent": { 
    label: "Affluent", 
    meaning: "You have established assets and are now in a stage that requires thoughtful diversification, risk-managed growth, and early legacy planning." 
  },
  "NW4-Private Wealth": { 
    label: "Private Wealth", 
    meaning: "You are operating at a governance and preservation level. Your plan prioritizes multi-asset strategy, global diversification, security, and intergenerational wealth." 
  }
};

const RISK_PROFILE_MEANINGS: Record<string, string> = {
  CONSERVATIVE: "You prefer stability and protection above aggressive growth. Your strategy prioritizes security and predictable returns.",
  MODERATE: "You value balance — steady returns with measured exposure to growth opportunities.",
  GROWTH: "You are comfortable with calculated swings because you have a long-term mindset and seek meaningful expansion.",
  AGGRESSIVE: "You think in decades, not days. You embrace volatility in pursuit of strong long-term returns."
};

const BEHAVIOUR_MEANINGS = {
  reaction_dips: {
    BUY_MORE: "You see dips as opportunity — a strategic long-term thinker.",
    STAY_INVESTED: "You remain calm during fluctuations — a disciplined investor.",
    REDUCE_EXPOSURE: "You prefer to manage downside carefully.",
    EXIT: "You value capital safety and want minimum turbulence."
  },
  volatility_comfort: {
    VERY_COMFORTABLE: "You're unfazed by swings; you trust long-term outcomes.",
    MODERATE: "You accept volatility as part of growth.",
    SLIGHTLY_UNCOMFORTABLE: "You prefer managed volatility and stable progression.",
    NOT_COMFORTABLE: "You want minimal fluctuation and steady results."
  },
  liquidity_need: {
    VERY_HIGH: "We prioritise flexible, low-lock instruments for you.",
    MODERATE: "Your plan can tolerate structured liquidity intervals.",
    LOW: "Your funds can work for you over longer cycles.",
    NONE: "Your horizon allows for maximum long-term strategy."
  }
};

const PORTFOLIO_PROFILE_MEANINGS: Record<string, string> = {
  CONSERVATIVE: "Your funds are positioned for maximum stability and minimal volatility.",
  MODERATE: "You have a balanced structure — steady returns with sustainable growth.",
  GROWTH: "Your portfolio leans into long-term expansion with calculated exposure.",
  AGGRESSIVE: "You hold a high-growth posture optimised for long-term wealth accumulation."
};

/**
 * Generate wealth blueprint narrative - only shows data relevant to this specific user
 */
export function generateNarrative(data: NarrativeData): string {
  const { 
    persona, netWorth, netWorthBand, riskScore, riskProfile, portfolio,
    cash_mid, real_estate_mid, business_mid, debt_mid,
    goals_selected_list, sources_of_funds_list, client_message,
    reaction_dips, volatility_comfort, liquidity_need
  } = data;

  const portfolioSummary = formatPortfolioSummary(portfolio);
  const personaNarrative = getPersonaNarrative(persona);
  const personaKey = persona.toUpperCase().replace(/\s+/g, "_");
  const riskKey = riskProfile.toUpperCase().replace(/\s+/g, "_");
  
  // Get only the relevant meanings for this user
  const personaMeaning = PERSONA_MEANINGS[personaKey] || personaNarrative;
  const netWorthBandInfo = NET_WORTH_BANDS[netWorthBand] || { label: netWorthBand.split("-")[1], meaning: "" };
  const riskMeaning = RISK_PROFILE_MEANINGS[riskKey] || "";
  const portfolioMeaning = PORTFOLIO_PROFILE_MEANINGS[riskKey] || "";

  let narrative = `🌿 MYRTLE WEALTH BLUEPRINT™
— Personalized Client Narrative

Reimagining Wealth. Building Prosperity Together.

1. Your Financial Identity — Who You Are Today

Based on the information you shared, you fall into the ${persona} segment.

What this means in simple language:
${personaMeaning}

This section helps us understand where you are on your financial journey so we can recommend solutions that match your lifestyle, goals, capacity, and long-term aspirations.

2. Your Net Worth Position — A Clear Picture`;

  // Add net worth breakdown if available
  if (cash_mid !== undefined || real_estate_mid !== undefined || business_mid !== undefined || debt_mid !== undefined) {
    narrative += `\n\nYour Financial Snapshot:`;
    if (cash_mid !== undefined) narrative += `\n• Cash & Investments: ₦${formatNumber(cash_mid)}`;
    if (real_estate_mid !== undefined) narrative += `\n• Real Estate: ₦${formatNumber(real_estate_mid)}`;
    if (business_mid !== undefined) narrative += `\n• Business Interests: ₦${formatNumber(business_mid)}`;
    if (debt_mid !== undefined) narrative += `\n• Debts & Liabilities: ₦${formatNumber(debt_mid)}`;
  }

  narrative += `\n\nAfter consolidating everything, your Estimated Net Worth is:
₦${formatNumber(netWorth)}

This places you in the ${netWorthBandInfo.label} category.

What this means:
${netWorthBandInfo.meaning}

Net worth assessment helps us understand your financial capacity, your liquidity needs, and the type of structures best suited for your long-term prosperity.

3. Your Investment Personality — Your Comfort With Risk

Your Risk Profile is: ${riskProfile}

What this means:
${riskMeaning}

Your Risk Score was ${riskScore}/28, which tells us how you naturally make financial decisions.

This tells us how you naturally make financial decisions and ensures your portfolio aligns with your temperament, not pressure or uncertainty.`;

  // Add goals & behaviour section if data available
  if (goals_selected_list || reaction_dips || volatility_comfort || liquidity_need) {
    narrative += `\n\n4. Your Goals & Financial Behaviour — What You're Building Toward`;
    
    if (goals_selected_list) {
      narrative += `\n\nYour Investment Goals:\n${goals_selected_list}`;
    }

    if (reaction_dips) {
      const reactionMeaning = BEHAVIOUR_MEANINGS.reaction_dips[reaction_dips as keyof typeof BEHAVIOUR_MEANINGS.reaction_dips];
      if (reactionMeaning) narrative += `\n\nYour Reaction to Market Dips: ${reactionMeaning}`;
    }

    if (volatility_comfort) {
      const volatilityMeaning = BEHAVIOUR_MEANINGS.volatility_comfort[volatility_comfort as keyof typeof BEHAVIOUR_MEANINGS.volatility_comfort];
      if (volatilityMeaning) narrative += `\n\nYour Comfort with Volatility: ${volatilityMeaning}`;
    }

    if (liquidity_need) {
      const liquidityMeaning = BEHAVIOUR_MEANINGS.liquidity_need[liquidity_need as keyof typeof BEHAVIOUR_MEANINGS.liquidity_need];
      if (liquidityMeaning) narrative += `\n\nYour Liquidity Needs: ${liquidityMeaning}`;
    }

    narrative += `\n\nThese behavioural insights help us design a portfolio you can stay consistent with — not just one that looks good on paper.`;
  }

  const sectionNumber = (goals_selected_list || reaction_dips || volatility_comfort || liquidity_need) ? 5 : 4;

  narrative += `\n\n${sectionNumber}. What We Recommend for You — The Myrtle Pathway

Using your Persona (${persona}) + Risk Profile (${riskProfile}) + Net Worth (${netWorthBandInfo.label}), your recommended investment path is:

Recommended Product Set
${portfolioSummary}

This may include:
• Money Market: Myrtle Nest
• Fixed Income: Myrtle Fixed Income Plus, Myrtle Treasury Notes
• Balanced Growth: Myrtle Balanced Plus, Myrtle WealthBlend
• FX Protection: Myrtle Dollar Shield

Each recommendation aligns with your goals, your time horizon, your personality, and your financial reality.

These recommendations align your goals, capacity, temperament, and long-term vision into a focused investment pathway.

${sectionNumber + 1}. Sample Portfolio Blueprint — Your Ideal Starting Mix

${portfolioSummary}

${portfolioMeaning}

This visual blueprint shows how your wealth is best positioned today, grounded in global standards and Myrtle's disciplined investment philosophy.

${sectionNumber + 2}. Your Wealth Story — Going Forward

${personaNarrative}

Your next step is simple:
We help you structure your money to support the life you're building — one that is confident, intentional, and aligned with your long-term aspirations.

This helps you see where you are, where you're going, and how we'll walk this journey with you — with clarity, structure, dignity, and care.`;

  // Add sources of funds if available
  if (sources_of_funds_list) {
    narrative += `\n\n${sectionNumber + 3}. Sources of Funds

${sources_of_funds_list}

This helps us understand how your wealth is generated and ensures your plan aligns with both regulatory expectations and your financial reality.`;
  }

  // Add client message if available
  if (client_message) {
    const messageSection = sources_of_funds_list ? sectionNumber + 4 : sectionNumber + 3;
    narrative += `\n\n${messageSection}. Your Message to Your Advisor

"${client_message}"

We hear you clearly and will integrate this into your structured wealth plan.`;
  }

  narrative += `\n\n🌿 Your Myrtle Advisor Will Now…
✓ Validate your details
✓ Confirm product selection
✓ Prepare your onboarding documents
✓ Build your personalized portfolio
✓ Set up your review cycle
✓ Walk you through each step in plain, human language

At Myrtle, our promise is to walk with you — with clarity, structure, dignity, and care.

We look forward to being a meaningful partner on your wealth journey.`;

  return narrative;
}

