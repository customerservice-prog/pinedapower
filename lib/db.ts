import { PrismaClient } from "@prisma/client";

// Prisma client singleton.
// Next.js can reload server modules in development, which would otherwise
// create a new PrismaClient (and a new DB connection pool) on every reload.
// Caching the instance on the global object avoids exhausting the
// connection pool. In production there is exactly one long-lived instance.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
