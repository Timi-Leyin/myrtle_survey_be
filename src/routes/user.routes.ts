/**
 * User Routes
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createUser, getUserById } from "../controllers/user.controller";

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone is required"),
    gender: z.string().min(1, "Gender is required"),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    occupation: z.string().min(1, "Occupation is required"),
    address: z.string().min(1, "Address is required"),
    maritalStatus: z.string().min(1, "Marital status is required"),
    dependantsCount: z.union([z.string(), z.number()]).transform((val) => {
      if (typeof val === "string") return parseInt(val, 10);
      return val;
    }),
  }),
});

const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
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
        const errors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
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
 * /api/user/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/create", validate(createUserSchema), createUser);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get("/:id", validate(getUserSchema), getUserById);

export default router;

