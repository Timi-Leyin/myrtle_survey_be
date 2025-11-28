/**
 * Create Admin User Script
 */

import { prisma } from "../prisma/client";
import bcrypt from "bcryptjs";
import { generateUUID } from "./helpers";

async function createAdmin() {
  try {
    const username = "oluwaseunadesoye";
    const email = "oluwaseunadesoye@myrtlewealth.com";
    const password = "myrtleng123@";

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists with this username or email");
      console.log("   Updating password...");
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword },
      });
      
      console.log("✅ Admin password updated successfully");
      return;
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.admin.create({
      data: {
        id: generateUUID(),
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log("✅ Admin user created successfully:");
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
  } catch (error: any) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

