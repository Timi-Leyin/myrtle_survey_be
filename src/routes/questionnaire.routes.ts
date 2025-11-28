/**
 * Questionnaire Routes
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  submitQuestionnaire,
  getQuestionnaireById,
  downloadQuestionnairePDF,
} from "../controllers/questionnaire.controller";

const router = Router();

// Validation schemas
const answerSchema = z.enum(["A", "B", "C", "D"]);

const submitQuestionnaireSchema = z.object({
  body: z.object({
    // User Information
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone is required"),
    gender: z.string().min(1, "Gender is required"),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    occupation: z.string().min(1, "Occupation is required"),
    address: z.string().min(1, "Address is required"),
    maritalStatus: z.string().min(1, "Marital status is required"),
    dependantsCount: z.union([z.string(), z.number()]).transform((val) => {
      if (typeof val === "string") return parseInt(val, 10);
      return val;
    }),
    // Questionnaire Answers
    answers: z.object({
      Q1: answerSchema,
      Q2: answerSchema,
      Q3: answerSchema,
      Q4: answerSchema,
      Q5: answerSchema,
      Q6: answerSchema,
      Q7: answerSchema,
      Q8: answerSchema,
      Q9: answerSchema,
      Q10: answerSchema,
      Q11: answerSchema,
      Q12: answerSchema,
      Q13: answerSchema,
      Q14: answerSchema,
    }),
  }),
});

const getQuestionnaireSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid questionnaire ID format"),
  }),
});

// Validation middleware
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        );
        res.status(400).json({
          success: false,
          message: `Validation error: ${errors.join(", ")}`,
        });
      } else {
        next(error);
      }
    }
  };
};

/**
 * @swagger
 * /api/questionnaire/submit:
 *   post:
 *     summary: Submit questionnaire and get analysis
 *     tags: [Questionnaires]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionnaireSubmission'
 *     responses:
 *       201:
 *         description: Questionnaire submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     submission:
 *                       type: object
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         netWorth:
 *                           type: number
 *                         netWorthBand:
 *                           type: string
 *                         riskScore:
 *                           type: number
 *                         riskProfile:
 *                           type: string
 *                         persona:
 *                           type: string
 *                         portfolio:
 *                           type: object
 *                         narrative:
 *                           type: string
 *       400:
 *         description: Validation error
 */
router.post(
  "/submit",
  validate(submitQuestionnaireSchema),
  submitQuestionnaire
);

/**
 * @swagger
 * /api/questionnaire/{id}:
 *   get:
 *     summary: Get questionnaire by ID
 *     tags: [Questionnaires]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Questionnaire found
 *       404:
 *         description: Questionnaire not found
 */
router.get("/:id", validate(getQuestionnaireSchema), getQuestionnaireById);

/**
 * @swagger
 * /api/questionnaire/{id}/pdf:
 *   get:
 *     summary: Download questionnaire PDF
 *     tags: [Questionnaires]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Questionnaire not found
 */
router.get("/:id/pdf", validate(getQuestionnaireSchema), downloadQuestionnairePDF);

export default router;
