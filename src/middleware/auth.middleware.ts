/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * Verify JWT token and attach admin info to request
 */
export function authenticateAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "No token provided. Please login first.",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const secret = process.env.JWT_SECRET || "myrtle-admin-secret-key-change-in-production";

    const decoded = jwt.verify(token, secret) as {
      id: string;
      username: string;
      email: string;
    };

    req.admin = decoded;
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    } else if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Authentication error",
      });
    }
  }
}

