/**
 * User Controller
 */

import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { generateUUID } from "../utils/helpers";

/**
 * Create a new user
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    console.log("📝 Creating new user...");
    console.log("   Request body:", JSON.stringify(req.body, null, 2));
    
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
    } = req.body;

    // Validate required fields
    if (!email || !fullName) {
      console.log(`   ❌ Missing required fields`);
      res.status(400).json({
        success: false,
        message: "Missing required fields: email and fullName are required",
      });
      return;
    }

    // Check if user already exists
    console.log(`   Checking if user with email ${email} exists...`);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`   ❌ User with email ${email} already exists`);
      res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Create new user
    console.log(`   Creating user: ${fullName} (${email})`);
    const user = await prisma.user.create({
      data: {
        id: generateUUID(),
        fullName,
        email,
        phone,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        occupation,
        address,
        maritalStatus,
        dependantsCount: parseInt(dependantsCount, 10),
      },
    });

    console.log(`   ✅ User created successfully with ID: ${user.id}`);
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          occupation: user.occupation,
          address: user.address,
          maritalStatus: user.maritalStatus,
          dependantsCount: user.dependantsCount,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    // Handle Prisma unique constraint violation
    if (error.code === "P2002") {
      console.log(`   ❌ Unique constraint violation: ${error.meta?.target?.join(", ")}`);
      res.status(400).json({
        success: false,
        message: `A user with this ${error.meta?.target?.join(" or ")} already exists`,
      });
      return;
    }

    console.error("❌ Error creating user:", error);
    console.error("   Error code:", error.code);
    console.error("   Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
}

/**
 * Get user by ID
 */
export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        questionnaires: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user",
    });
  }
}

