/**
 * Helper utility functions
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate UUID
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Format currency (Nigerian Naira)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-NG");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // Check if it's a valid Nigerian phone number format
  return /^(\+?234|0)?[789]\d{9}$/.test(cleaned);
}

