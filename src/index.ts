/**
 * Application Entry Point
 */

import dotenv from "dotenv";
import app from "./app";
import { prisma } from "./prisma/client";
import { testEmailConfiguration } from "./services/email.service";
import { seedAdmin } from "./utils/admin.seed";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Validate environment variables
console.log("🔍 Environment Configuration:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`   PORT: ${PORT}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Missing"}`);

// Test database connection
async function startServer() {
  try {
    console.log("🔌 Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    
    // Test email configuration
    console.log("📧 Testing email configuration...");
    await testEmailConfiguration();
    
    // Seed admin user if none exists
    console.log("👤 Checking admin user...");
    await seedAdmin();
    
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(50));
      console.log(`🚀 Myrtle Wealth Blueprint Engine API`);
      console.log(`   Running on: http://localhost:${PORT}`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`💚 Brand colors: #27dc85 (primary), #FFFFFF`);
      console.log("=".repeat(50) + "\n");
    });
  } catch (error: any) {
    console.error("❌ Failed to connect to database:");
    console.error(`   Error: ${error.message}`);
    console.error("\n💡 Make sure:");
    console.error("   1. PostgreSQL is running");
    console.error("   2. DATABASE_URL in .env is correct");
    console.error("   3. Database exists and is accessible");
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

