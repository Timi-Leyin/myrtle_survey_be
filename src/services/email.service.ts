/**
 * Email Service
 * Handles sending emails using Nodemailer
 */

import nodemailer from "nodemailer";
import fetch from "node-fetch";
import { NETWORTH_MIDPOINTS } from "../utils/networth.config";
import { getQuestionLabel, getPersonaNarrative } from "../utils/question-labels";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const REQUIRED_EMAIL_ENV = ["EMAIL_USER", "EMAIL_PASS"] as const;

function hasSMTPConfig(): boolean {
  return REQUIRED_EMAIL_ENV.every((key) => Boolean(process.env[key]));
}

function buildSMTPConfig(): EmailConfig {
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const secureEnv = process.env.EMAIL_SECURE?.toLowerCase();
  const secure = secureEnv ? secureEnv === "true" : port === 465;

  return {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string,
    },
  };
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

const PLUNK_URL = "https://api.useplunk.com/v1/send";

/**
 * Create email transporter
 * Uses Nodemailer's test account for development (no config needed)
 * Falls back to SMTP if credentials are provided
 */
async function createTransporter() {
  if (hasSMTPConfig()) {
    const config = buildSMTPConfig();
    console.log(
      `📧 Using configured SMTP server (${config.host}:${config.port}, secure=${config.secure})`
    );
    return nodemailer.createTransport(config);
  }

  if (process.env.NODE_ENV === "production" && !process.env.PLUNK_API_KEY) {
    throw new Error(
      "Email credentials are missing. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS or PLUNK_API_KEY."
    );
  }

  console.log("📧 Using Nodemailer test account (development mode - no config needed)");
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function sendViaPlunk(options: SendEmailOptions): Promise<void> {
  if (!process.env.PLUNK_API_KEY) {
    throw new Error("PLUNK_API_KEY is not set");
  }

  console.log("📨 Sending email via Plunk API...", {
    to: options.to,
    subject: options.subject,
    hasAttachments: Boolean(options.attachments?.length),
  });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.PLUNK_API_KEY}`,
    "Content-Type": "application/json",
  };

  // Prepare payload matching Java example
  const payload: any = {
    to: options.to,
    subject: options.subject,
    body: options.html, // Plunk uses 'body' for HTML content
  };

  // Add text version if provided
  if (options.text) {
    payload.text = options.text;
  }

  // Add attachments if provided (base64 encoded)
  if (options.attachments && options.attachments.length > 0) {
    payload.attachments = options.attachments.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content.toString("base64"),
      contentType: attachment.contentType,
    }));
  }

  const response = await fetch(PLUNK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error("📨 Plunk API error response:", responseData);
    throw new Error(
      `Plunk API error (${response.status}): ${JSON.stringify(responseData)}`
    );
  }

  console.log("📨 Plunk API response:", {
    status: response.status,
    statusText: response.statusText,
    data: responseData,
  });
}

/**
 * Send email
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const fromEmail =
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER ||
      "noreply@myrtlewealth.com";

    if (process.env.PLUNK_API_KEY) {
      await sendViaPlunk(options);
      console.log("✅ Email sent via Plunk API:", {
        to: options.to,
        subject: options.subject,
      });
      return true;
    }

    const transporter = await createTransporter();
    console.log("📨 Sending email via SMTP/Nodemailer...", {
      to: options.to,
      subject: options.subject,
      host: (transporter as any).options?.host,
      port: (transporter as any).options?.port,
    });
    const mailOptions: any = {
      from: `"Myrtle Wealth" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // Plain text version
      html: options.html,
    };

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    
    // If using test account, log the preview URL
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("✅ Email sent (Test Account):");
        console.log(`   📧 Preview URL: ${previewUrl}`);
        console.log(`   👆 Click the URL above to view the email in your browser`);
        console.log(`   📬 Sent to: ${options.to}`);
      }
    } else {
      console.log("✅ Email sent successfully:", {
        to: options.to,
        messageId: info.messageId,
      });
    }
    return true;
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

/**
 * Send email with attachment (wrapper for sendEmail)
 */
export async function sendEmailWithAttachment(options: SendEmailOptions): Promise<boolean> {
  return await sendEmail(options);
}

/**
 * Send onboarding email with wealth blueprint
 */
export async function sendOnboardingEmail(
  email: string,
  fullName: string,
  narrative: string,
  analysisData: {
    netWorth: number;
    netWorthBand: string;
    riskScore: number;
    riskProfile: string;
    persona: string;
    portfolio: Record<string, any>;
  },
  submissionId: string,
  answers?: Record<string, string | string[]>,
  narrativeData?: any
): Promise<boolean> {
  const subject = "🌿 MYRTLE WEALTH BLUEPRINT™ — Personalized Client Narrative";
  
  // Get answer values
  const q1Income = answers?.Q1 ? getQuestionLabel("Q1", answers.Q1 as string) : "";
  const q2Stages = answers?.Q2 ? getQuestionLabel("Q2", answers.Q2) : "";
  const q3Horizon = answers?.Q3 ? getQuestionLabel("Q3", answers.Q3 as string) : "";
  
  // Calculate midpoints for net worth display
  const q4Mid = answers?.Q4 ? NETWORTH_MIDPOINTS.Q4[answers.Q4 as keyof typeof NETWORTH_MIDPOINTS.Q4] || 0 : 0;
  const q5Mid = answers?.Q5 ? NETWORTH_MIDPOINTS.Q5[answers.Q5 as keyof typeof NETWORTH_MIDPOINTS.Q5] || 0 : 0;
  const q6Mid = answers?.Q6 ? NETWORTH_MIDPOINTS.Q6[answers.Q6 as keyof typeof NETWORTH_MIDPOINTS.Q6] || 0 : 0;
  const q7Mid = answers?.Q7 ? NETWORTH_MIDPOINTS.Q7[answers.Q7 as keyof typeof NETWORTH_MIDPOINTS.Q7] || 0 : 0;
  
  const formatCurrency = (value: number) => `₦${value.toLocaleString("en-NG")}`;
  
  // Get investment goals (multi-select Q8)
  const q8Goals = answers?.Q8 ? getQuestionLabel("Q8", answers.Q8) : "";
  const q9Reaction = answers?.Q9 ? getQuestionLabel("Q9", answers.Q9 as string) : "";
  const q10Comfort = answers?.Q10 ? getQuestionLabel("Q10", answers.Q10 as string) : "";
  const q14Liquidity = answers?.Q14 ? getQuestionLabel("Q14", answers.Q14 as string) : "";
  
  // Get sources of funds (multi-select Q15)
  const q15Sources = answers?.Q15 ? getQuestionLabel("Q15", answers.Q15) : "";
  
  // Get advisor question (Q16)
  const q16Message = answers?.Q16 ? (answers.Q16 as string) : "";
  
  // Format portfolio allocation
  const portfolioParts: string[] = [];
  if (analysisData.portfolio.cash) portfolioParts.push(`${analysisData.portfolio.cash}% Cash`);
  if (analysisData.portfolio.income) portfolioParts.push(`${analysisData.portfolio.income}% Income`);
  if (analysisData.portfolio.growth) portfolioParts.push(`${analysisData.portfolio.growth}% Growth`);
  if (analysisData.portfolio.fx) portfolioParts.push(`${analysisData.portfolio.fx}% FX`);
  if (analysisData.portfolio.alternatives) portfolioParts.push(`${analysisData.portfolio.alternatives}% Alternatives`);
  const portfolioAllocation = portfolioParts.length > 0 ? portfolioParts.join(" • ") : "Custom allocation based on your unique profile";
  
  // Get net worth band label
  const netWorthBandLabel = analysisData.netWorthBand.split("-")[1] || analysisData.netWorthBand;
  
  // Get persona narrative
  const personaNarrative = getPersonaNarrative(analysisData.persona);
  
  // Helper function to get only the relevant risk profile meaning
  const getRiskProfileMeaning = (profile: string): string => {
    const meanings: Record<string, string> = {
      CONSERVATIVE: "You prefer stability and protection above aggressive growth. Your strategy prioritizes security and predictable returns.",
      MODERATE: "You value balance — steady returns with measured exposure to growth opportunities.",
      GROWTH: "You are comfortable with calculated swings because you have a long-term mindset and seek meaningful expansion.",
      AGGRESSIVE: "You think in decades, not days. You embrace volatility in pursuit of strong long-term returns."
    };
    return meanings[profile.toUpperCase()] || "";
  };
  
  // Helper function to get only the relevant net worth band meaning
  const getNetWorthBandMeaning = (band: string): string => {
    const meanings: Record<string, string> = {
      EMERGING: "You are in the early wealth-building phase. Your current structure focuses on stability and growth foundations.",
      "MASS AFFLUENT": "You have a growing financial base and expanding opportunities. With structure, your net worth can scale rapidly.",
      AFFLUENT: "You have established assets and are now in a stage that requires thoughtful diversification, risk-managed growth, and early legacy planning.",
      "PRIVATE WEALTH": "You are operating at a governance and preservation level. Your plan prioritizes multi-asset strategy, global diversification, security, and intergenerational wealth."
    };
    return meanings[band.toUpperCase()] || "";
  };
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.8;
          color: #333;
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #27dc85;
          padding-bottom: 20px;
        }
        .logo {
          color: #27dc85;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .tagline {
          color: #666;
          font-size: 14px;
          font-style: italic;
          margin-top: 5px;
        }
        h1 {
          color: #333;
          font-size: 24px;
          margin: 20px 0;
        }
        h2 {
          color: #27dc85;
          font-size: 20px;
          margin-top: 30px;
          margin-bottom: 15px;
          border-left: 4px solid #27dc85;
          padding-left: 15px;
        }
        .section {
          margin: 25px 0;
        }
        .highlight {
          color: #27dc85;
          font-weight: bold;
        }
        ul {
          margin: 15px 0;
          padding-left: 25px;
        }
        li {
          margin: 8px 0;
        }
        .net-worth-breakdown {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 6px;
          margin: 15px 0;
        }
        .portfolio-box {
          background-color: #f0f9f5;
          border-left: 4px solid #27dc85;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .next-steps {
          background-color: #fff9e6;
          border-left: 4px solid #ffc107;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🌿 MYRTLE WEALTH BLUEPRINT™</div>
          <div class="tagline">Reimagining Wealth. Building Prosperity Together.</div>
        </div>
        
        <h1>Personalized Client Narrative</h1>
        
        <div class="section">
          <h2>1. Your Financial Identity — Who You Are Today</h2>
          <p>Based on the information you shared, you fall into the <span class="highlight">${analysisData.persona}</span> segment.</p>
          <p><strong>What this means in simple language:</strong></p>
          <p style="font-style: italic; font-size: 16px; color: #555; margin: 15px 0; padding-left: 20px; border-left: 3px solid #27dc85;">
            ${personaNarrative}
          </p>
          <p>This gives us clarity on how best to serve you and which financial solutions will create the most meaningful impact.</p>
        </div>
        
        <div class="section">
          <h2>2. Your Net Worth Position — A Clear Picture</h2>
          <p>From your responses:</p>
          <div class="net-worth-breakdown">
            <ul>
              <li><strong>Cash &amp; Investments:</strong> ${formatCurrency(q4Mid)}</li>
              <li><strong>Real Estate:</strong> ${formatCurrency(q5Mid)}</li>
              <li><strong>Business/Income Assets:</strong> ${formatCurrency(q6Mid)}</li>
              <li><strong>Debts:</strong> ${formatCurrency(q7Mid)}</li>
            </ul>
          </div>
          <p>After consolidating everything, your <strong>Estimated Net Worth is:</strong></p>
          <p style="font-size: 24px; font-weight: bold; color: #27dc85; text-align: center; margin: 20px 0;">
            ${formatCurrency(analysisData.netWorth)}
          </p>
          <p>This places you in the <span class="highlight">${netWorthBandLabel}</span> category.</p>
          <p><strong>What this means:</strong></p>
          <p>${getNetWorthBandMeaning(netWorthBandLabel)}</p>
          <p>Net worth assessment helps us understand your financial capacity, your liquidity needs, and the type of structures best suited for your long-term prosperity.</p>
        </div>
        
        <div class="section">
          <h2>3. Your Investment Personality — Your Comfort With Risk</h2>
          <p>Your answers show that your <strong>Risk Profile is:</strong></p>
          <p style="font-size: 20px; font-weight: bold; color: #27dc85; margin: 15px 0;">${analysisData.riskProfile}</p>
          <p><strong>What this means:</strong></p>
          <p>${getRiskProfileMeaning(analysisData.riskProfile)}</p>
          <p>Your Risk Score was <span class="highlight">${analysisData.riskScore}/28</span>, which tells us how you naturally make money decisions.</p>
          <p>This tells us how you naturally make financial decisions and ensures your portfolio aligns with your temperament, not pressure or uncertainty.</p>
        </div>
        
        <div class="section">
          <h2>4. Your Goals &amp; Financial Behaviour — What You're Building Toward</h2>
          <p>From your goal and behaviour assessments:</p>
          <ul>
            ${q8Goals ? `<li><strong>Primary Goals Selected:</strong> ${q8Goals}</li>` : ''}
            ${q9Reaction ? `<li><strong>Your reaction during market dips:</strong> ${q9Reaction}</li>` : ''}
            ${q10Comfort ? `<li><strong>Comfort with volatility:</strong> ${q10Comfort}</li>` : ''}
            ${q14Liquidity ? `<li><strong>Liquidity need:</strong> ${q14Liquidity}</li>` : ''}
          </ul>
          <p>This shows us:</p>
          <ul>
            <li>How disciplined you are</li>
            <li>How patient your money can be</li>
            <li>How long your funds can stay invested</li>
            <li>The best possible strategy to help you win</li>
          </ul>
        </div>
        
        <div class="section">
          <h2>5. What We Recommend for You — The Myrtle Pathway</h2>
          <p>Using your Persona + Risk Profile + Net Worth, your recommended investment path includes:</p>
          <ul>
            <li><strong>Money Market:</strong> Myrtle Nest</li>
            <li><strong>Fixed Income:</strong> Myrtle Fixed Income Plus, Myrtle Treasury Notes</li>
            <li><strong>Balanced Growth:</strong> Myrtle Balanced Plus, Myrtle WealthBlend</li>
            <li><strong>FX Protection:</strong> Myrtle Dollar Shield</li>
          </ul>
          <p>Each recommendation aligns with your goals, your time horizon, your personality, and your financial reality.</p>
        </div>
        
        <div class="section">
          <h2>6. Sample Portfolio Blueprint — Your Ideal Starting Mix</h2>
          <p>Here is your <strong>Model Portfolio Allocation</strong>, crafted from global standards and Myrtle's investment framework:</p>
          <div class="portfolio-box">
            <p style="font-size: 18px; font-weight: bold; color: #27dc85;">${portfolioAllocation}</p>
          </div>
          <p>This gives you:</p>
          <ul>
            <li>Stability</li>
            <li>Predictability</li>
            <li>Sustainable growth</li>
            <li>Long-term wealth preservation</li>
            <li>Exposure that matches your goal and risk profile</li>
          </ul>
          <p>Your advisor will fine-tune the final percentages based on your cash flow, timelines, and upcoming financial events.</p>
        </div>
        
        <div class="section">
          <h2>7. Your Wealth Story Going Forward</h2>
          <p>Across all categories — income, net worth, behaviour, goals, and values — your blueprint shows that you are:</p>
          <p style="font-style: italic; font-size: 16px; color: #555; margin: 15px 0; padding-left: 20px; border-left: 3px solid #27dc85;">
            ${personaNarrative}
          </p>
          <p>Your next step is simple:</p>
          <p>We help you structure your money to support the life you're building — one that is confident, intentional, and aligned with your long-term aspirations.</p>
          <p>At Myrtle, our promise is to walk with you — with clarity, structure, dignity, and care.</p>
        </div>
        
        ${q15Sources ? `
        <div class="section">
          <h2>8. Sources of Funds</h2>
          <p>You indicated your investment funds come from:</p>
          <p style="font-size: 16px; color: #555; margin: 15px 0; padding-left: 20px; border-left: 3px solid #27dc85;">
            ${q15Sources}
          </p>
        </div>
        ` : ''}
        
        ${q16Message ? `
        <div class="section">
          <h2>9. Your Message to Your Advisor</h2>
          <p style="font-style: italic; font-size: 16px; color: #555; margin: 15px 0; padding: 20px; background-color: #f9f9f9; border-radius: 6px;">
            "${q16Message}"
          </p>
          <p>We hear you, and we'll take this into account as we craft your personalized wealth plan.</p>
        </div>
        ` : ''}
        
        <div class="next-steps">
          <h2 style="margin-top: 0;">🌿 Your Myrtle Advisor Will Now…</h2>
          <ul>
            <li>Validate your details</li>
            <li>Confirm product selection</li>
            <li>Prepare your onboarding documents</li>
            <li>Build your personalized portfolio</li>
            <li>Set up your review cycle</li>
            <li>Walk you through each step in plain, human, relatable language</li>
          </ul>
          <p style="margin-top: 20px; margin-bottom: 0;"><strong>We look forward to being a meaningful partner on your wealth journey.</strong></p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br><strong>The Myrtle Wealth Team</strong></p>
          <p style="font-size: 12px; color: #999; margin-top: 15px;">
            This email was sent to ${email}. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email without attachment
  return await sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    if (process.env.PLUNK_API_KEY) {
      console.log("✅ Email server is ready (Plunk API)");
      return true;
    }

    const transporter = await createTransporter();
    await transporter.verify();
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("✅ Using Nodemailer test account (development mode)");
      console.log("   📧 Emails will be sent to a test inbox");
      console.log("   🔗 Preview URLs will be logged in console when emails are sent");
    } else {
      console.log("✅ Email server is ready to send messages (SMTP)");
    }
    return true;
  } catch (error: any) {
    console.error("❌ Email server configuration error:", error.message);
    return false;
  }
}

