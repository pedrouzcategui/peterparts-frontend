import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { normalizePostgresConnectionString } from "@/lib/postgres-connection-string";

function createPrismaClient(connectionString: string) {
  const adapter = new PrismaPg({
    connectionString,
  });
  return new PrismaClient({ adapter });
}

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClientInstance;
  prismaConnectionString?: string;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const normalizedConnectionString = normalizePostgresConnectionString(connectionString);
const shouldReusePrisma =
  globalForPrisma.prisma &&
  globalForPrisma.prismaConnectionString === normalizedConnectionString;

export const prisma = shouldReusePrisma
  ? globalForPrisma.prisma!
  : createPrismaClient(normalizedConnectionString);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConnectionString = normalizedConnectionString;
}
