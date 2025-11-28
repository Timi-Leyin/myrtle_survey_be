/**
 * Prisma Client Singleton
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? [
          { level: "query", emit: "event" },
          { level: "error", emit: "stdout" },
          { level: "warn", emit: "stdout" },
        ]
      : [{ level: "error", emit: "stdout" }],
  });

// Log database queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query" as never, (e: any) => {
    console.log(`🔍 Query: ${e.query}`);
    console.log(`   Params: ${e.params}`);
    console.log(`   Duration: ${e.duration}ms`);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

