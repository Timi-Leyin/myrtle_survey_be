/**
 * Questionnaire Controller
 */

import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { calculateScores } from "../services/scoring.service";
import { generateNarrative } from "../services/narrative.service";
import { sendOnboardingEmail } from "../services/email.service";
import { generateWealthBlueprintPDF, getPDFFilename } from "../services/pdf.service";
import { generateUUID } from "../utils/helpers";

/**
 * Submit questionnaire and generate analysis
 */
export async function submitQuestionnaire(req: Request, res: Response): Promise<void> {
  try {
    console.log("📊 Processing questionnaire submission...");
    const {
      fullName,
      email,
      phone,
      gender,
      dateOfBirth,
      occupation,
      address,
      maritalStatus,
      dependantsCount,
      answers,
      advisorQuestion,
    } = req.body;
    
    console.log(`   User: ${fullName} (${email})`);
    console.log(`   Answers received: ${Object.keys(answers || {}).length} questions`);

    // Validate that all required questions are answered (Q1-Q14)
    const requiredQuestions = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12", "Q13", "Q14"];
    const missingQuestions = requiredQuestions.filter((q) => !answers[q]);

    if (missingQuestions.length > 0) {
      res.status(400).json({
        success: false,
        message: `Validation error: Missing answers for ${missingQuestions.join(", ")}`,
      });
      return;
    }

    // Multi-select questions (should be arrays)
    const multiSelectQuestions = ["Q2", "Q8", "Q15"];
    
    // Single-select questions (should be strings with A-F format)
    const singleSelectQuestions = ["Q1", "Q3", "Q4", "Q5", "Q6", "Q7", "Q9", "Q10", "Q11", "Q12", "Q13", "Q14"];

    // Build complete answers object
    const allAnswers: Record<string, any> = { ...answers };
    
    // Validate Q16 (open text) and advisorQuestion
    if (answers.Q16) {
      allAnswers.Q16 = answers.Q16;
    }
    if (advisorQuestion) {
      allAnswers.advisorQuestion = advisorQuestion;
    }

    // Validate single-select answers (A-F format)
    const validSingleAnswers = ["A", "B", "C", "D", "E", "F"];
    for (const question of singleSelectQuestions) {
      const answer = allAnswers[question];
      if (answer && !validSingleAnswers.includes(answer as string)) {
        res.status(400).json({
          success: false,
          message: `Validation error: Invalid answer format for ${question}. Must be A, B, C, D, E, or F`,
        });
        return;
      }
    }

    // Validate multi-select answers (arrays of codes)
    for (const question of multiSelectQuestions) {
      const answer = allAnswers[question];
      if (answer && question !== "Q15") { // Q15 is optional
        if (!Array.isArray(answer) || answer.length === 0) {
          res.status(400).json({
            success: false,
            message: `Validation error: ${question} must be an array with at least one selection`,
          });
          return;
        }
      }
    }

    // Calculate scores (using filtered answers)
    console.log("   Calculating scores...");
    const scoringResult = calculateScores(allAnswers);
    console.log(`   ✅ Net Worth: ₦${scoringResult.netWorth.toLocaleString()}`);
    console.log(`   ✅ Net Worth Band: ${scoringResult.netWorthBand}`);
    console.log(`   ✅ Risk Score: ${scoringResult.riskScore}/28`);
    console.log(`   ✅ Risk Profile: ${scoringResult.riskProfile}`);
    console.log(`   ✅ Persona: ${scoringResult.persona}`);

    // Generate narrative
    console.log("   Generating narrative...");
    
    // Prepare extended narrative data
    const { NETWORTH_MIDPOINTS } = require("../utils/networth.config");
    const { getQuestionLabel } = require("../utils/question-labels");
    
    const narrativeData = {
      persona: scoringResult.persona,
      netWorth: scoringResult.netWorth,
      netWorthBand: scoringResult.netWorthBand,
      riskScore: scoringResult.riskScore,
      riskProfile: scoringResult.riskProfile,
      portfolio: scoringResult.portfolio,
      // Net worth midpoints
      cash_mid: allAnswers.Q4 ? NETWORTH_MIDPOINTS.Q4[allAnswers.Q4 as keyof typeof NETWORTH_MIDPOINTS.Q4] : undefined,
      real_estate_mid: allAnswers.Q5 ? NETWORTH_MIDPOINTS.Q5[allAnswers.Q5 as keyof typeof NETWORTH_MIDPOINTS.Q5] : undefined,
      business_mid: allAnswers.Q6 ? NETWORTH_MIDPOINTS.Q6[allAnswers.Q6 as keyof typeof NETWORTH_MIDPOINTS.Q6] : undefined,
      debt_mid: allAnswers.Q7 ? NETWORTH_MIDPOINTS.Q7[allAnswers.Q7 as keyof typeof NETWORTH_MIDPOINTS.Q7] : undefined,
      // Goals and sources
      goals_selected_list: allAnswers.Q8 ? getQuestionLabel("Q8", allAnswers.Q8) : undefined,
      sources_of_funds_list: allAnswers.Q15 ? getQuestionLabel("Q15", allAnswers.Q15) : undefined,
      client_message: allAnswers.Q16 || undefined,
      // Behaviour
      reaction_dips: allAnswers.Q9 ? allAnswers.Q9.toUpperCase().replace("A", "BUY_MORE").replace("B", "STAY_INVESTED").replace("C", "REDUCE_EXPOSURE").replace("D", "EXIT") : undefined,
      volatility_comfort: allAnswers.Q10 ? allAnswers.Q10.toUpperCase().replace("A", "VERY_COMFORTABLE").replace("B", "MODERATE").replace("C", "SLIGHTLY_UNCOMFORTABLE").replace("D", "NOT_COMFORTABLE") : undefined,
      liquidity_need: allAnswers.Q14 ? allAnswers.Q14.toUpperCase().replace("A", "VERY_HIGH").replace("B", "MODERATE").replace("C", "LOW").replace("D", "NONE") : undefined,
    };
    
    const narrative = generateNarrative(narrativeData);

    // Save to database
    console.log("   Saving questionnaire to database...");
    const questionnaire = await prisma.questionnaire.create({
      data: {
        id: generateUUID(),
        // User Information
        fullName,
        email,
        phone,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        occupation,
        address,
        maritalStatus,
        dependantsCount: parseInt(dependantsCount, 10),
        // Questionnaire Answers (Q1-Q14 for scoring, Q15 and advisorQuestion stored as text)
        answers: allAnswers as any, // PostgreSQL JSON field - Prisma handles serialization
        // Analysis Results
        netWorth: scoringResult.netWorth,
        netWorthBand: scoringResult.netWorthBand,
        riskScore: scoringResult.riskScore,
        riskProfile: scoringResult.riskProfile,
        persona: scoringResult.persona,
        portfolio: scoringResult.portfolio as any, // PostgreSQL JSON field - Prisma handles serialization
        narrative,
      },
    });
    console.log(`   ✅ Questionnaire saved with ID: ${questionnaire.id}`);

    // Send onboarding email with PDF attachment (non-blocking)
    console.log("   Sending onboarding email with PDF attachment...");
    sendOnboardingEmail(
      email,
      fullName,
      narrative,
      {
        netWorth: scoringResult.netWorth,
        netWorthBand: scoringResult.netWorthBand,
        riskScore: scoringResult.riskScore,
        riskProfile: scoringResult.riskProfile,
        persona: scoringResult.persona,
        portfolio: scoringResult.portfolio,
      },
      questionnaire.id,
      allAnswers,
      narrativeData
    ).catch((error) => {
      console.error("   ⚠️  Failed to send email (non-critical):", error);
    });

    // Return response
    res.status(201).json({
      success: true,
      data: {
        submission: {
          id: questionnaire.id,
          fullName: questionnaire.fullName,
          email: questionnaire.email,
          createdAt: questionnaire.createdAt,
        },
        analysis: {
          netWorth: scoringResult.netWorth,
          netWorthBand: scoringResult.netWorthBand,
          riskScore: scoringResult.riskScore,
          riskProfile: scoringResult.riskProfile,
          persona: scoringResult.persona,
          portfolio: scoringResult.portfolio,
          narrative,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error submitting questionnaire:", error);
    console.error("   Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit questionnaire",
    });
  }
}

/**
 * Get questionnaire by ID
 */
export async function getQuestionnaireById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
    });

    if (!questionnaire) {
      res.status(404).json({
        success: false,
        message: "Questionnaire not found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        questionnaire: {
          ...questionnaire,
          // PostgreSQL JSON fields are already parsed by Prisma
          answers: questionnaire.answers,
          portfolio: questionnaire.portfolio,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching questionnaire:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questionnaire",
    });
  }
}

/**
 * Download PDF for questionnaire
 */
export async function downloadQuestionnairePDF(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    console.log(`📄 Generating PDF for questionnaire: ${id}`);

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
    });

    if (!questionnaire) {
      res.status(404).json({
        success: false,
        message: "Questionnaire not found",
      });
      return;
    }

    // Generate PDF
    const pdfBuffer = await generateWealthBlueprintPDF(
      questionnaire.narrative,
      {
        fullName: questionnaire.fullName,
        email: questionnaire.email,
        createdAt: questionnaire.createdAt,
      },
      {
        netWorth: questionnaire.netWorth,
        netWorthBand: questionnaire.netWorthBand,
        riskScore: questionnaire.riskScore,
        riskProfile: questionnaire.riskProfile,
        persona: questionnaire.persona,
        portfolio: questionnaire.portfolio as any,
      }
    );

    const filename = getPDFFilename(questionnaire.fullName, questionnaire.id);

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    console.log(`   ✅ PDF generated: ${filename} (${pdfBuffer.length} bytes)`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("❌ Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate PDF",
    });
  }
}

