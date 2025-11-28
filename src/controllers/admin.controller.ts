/**
 * Admin Controller
 */

import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUUID } from "../utils/helpers";
import { AuthRequest } from "../middleware/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "myrtle-admin-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

/**
 * Admin Login
 */
export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
      return;
    }

    console.log("🔐 Admin login attempt:", username);

    // Find admin by username or email
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!admin) {
      console.log("   ❌ Admin not found");
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      console.log("   ❌ Invalid password");
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log("   ✅ Admin logged in successfully");

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error during admin login:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to login",
    });
  }
}

/**
 * Get all questionnaires (Admin only)
 */
export async function getAllQuestionnaires(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    console.log(`📊 Admin ${req.admin?.username} viewing questionnaires (page ${page})`);

    const [questionnaires, total] = await Promise.all([
      prisma.questionnaire.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.questionnaire.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        questionnaires: questionnaires.map((q) => ({
          id: q.id,
          fullName: q.fullName,
          email: q.email,
          phone: q.phone,
          netWorth: q.netWorth,
          netWorthBand: q.netWorthBand,
          riskScore: q.riskScore,
          riskProfile: q.riskProfile,
          persona: q.persona,
          createdAt: q.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching questionnaires:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questionnaires",
    });
  }
}

/**
 * Get questionnaire details by ID (Admin only)
 */
export async function getQuestionnaireDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    console.log(`📄 Admin ${req.admin?.username} viewing questionnaire: ${id}`);

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
          answers: questionnaire.answers,
          portfolio: questionnaire.portfolio,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching questionnaire:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questionnaire",
    });
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    console.log(`📈 Admin ${req.admin?.username} viewing dashboard stats`);

    const [
      totalSubmissions,
      totalNetWorth,
      personaCounts,
      riskProfileCounts,
    ] = await Promise.all([
      prisma.questionnaire.count(),
      prisma.questionnaire.aggregate({
        _sum: { netWorth: true },
      }),
      prisma.questionnaire.groupBy({
        by: ["persona"],
        _count: true,
      }),
      prisma.questionnaire.groupBy({
        by: ["riskProfile"],
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalSubmissions,
          totalNetWorth: totalNetWorth._sum.netWorth || 0,
          averageNetWorth: totalSubmissions > 0 
            ? (totalNetWorth._sum.netWorth || 0) / totalSubmissions 
            : 0,
        },
        personaDistribution: personaCounts.reduce((acc, item) => {
          acc[item.persona] = item._count;
          return acc;
        }, {} as Record<string, number>),
        riskProfileDistribution: riskProfileCounts.reduce((acc, item) => {
          acc[item.riskProfile] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard stats",
    });
  }
}

