/**
 * Admin Routes
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  adminLogin,
  getAllQuestionnaires,
  getQuestionnaireDetails,
  getDashboardStats,
} from "../controllers/admin.controller";
import { authenticateAdmin, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// Validation schemas
const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

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
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validate(loginSchema), adminLogin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", authenticateAdmin, getDashboardStats);

/**
 * @swagger
 * /api/admin/questionnaires:
 *   get:
 *     summary: Get all questionnaires
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of questionnaires
 *       401:
 *         description: Unauthorized
 */
router.get("/questionnaires", authenticateAdmin, getAllQuestionnaires);

/**
 * @swagger
 * /api/admin/questionnaires/{id}:
 *   get:
 *     summary: Get questionnaire details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Questionnaire details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Questionnaire not found
 */
router.get("/questionnaires/:id", authenticateAdmin, getQuestionnaireDetails);

export default router;

