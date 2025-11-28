/**
 * Admin Seed Utility
 * Creates default admin user if none exists
 */

import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import { generateUUID } from "./helpers";

/**
 * Create default admin user
 * Default credentials:
 * Username: admin
 * Password: admin123
 * 
 * ⚠️ CHANGE THESE IN PRODUCTION!
 */
export async function seedAdmin(): Promise<void> {
  try {
    const adminCount = await prisma.admin.count();

    if (adminCount > 0) {
      console.log("✅ Admin user already exists");
      return;
    }

    const defaultPassword = "admin123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.admin.create({
      data: {
        id: generateUUID(),
        username: "admin",
        email: "admin@myrtlewealth.com",
        password: hashedPassword,
      },
    });

    console.log("✅ Default admin user created:");
    console.log("   Username: admin");
    console.log("   Email: admin@myrtlewealth.com");
    console.log("   Password: admin123");
    console.log("   ⚠️  Please change the password after first login!");
  } catch (error: any) {
    console.error("❌ Error seeding admin:", error);
  }
}

