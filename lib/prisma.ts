import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { normalizePostgresConnectionString } from "@/lib/postgres-connection-string";

const PRISMA_CLIENT_CACHE_KEY = "forum-thread-soft-delete-v2";

function createPrismaClient(connectionString: string) {
  const adapter = new PrismaPg({
    connectionString,
  });
  return new PrismaClient({ adapter });
}

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

function hasRequiredDelegates(
  client: PrismaClientInstance | undefined,
): client is PrismaClientInstance {
  if (!client) {
    return false;
  }

  const delegateClient = client as PrismaClientInstance & {
    user?: { findUnique?: unknown };
    account?: { findUnique?: unknown };
    session?: { findUnique?: unknown };
    forumThread?: { findMany?: unknown };
    forumReply?: { findMany?: unknown };
    forumThreadVote?: { findUnique?: unknown };
    forumReplyVote?: { findUnique?: unknown };
  };

  return (
    typeof delegateClient.user?.findUnique === "function" &&
    typeof delegateClient.account?.findUnique === "function" &&
    typeof delegateClient.session?.findUnique === "function" &&
    typeof delegateClient.forumThread?.findMany === "function" &&
    typeof delegateClient.forumReply?.findMany === "function" &&
    typeof delegateClient.forumThreadVote?.findUnique === "function" &&
    typeof delegateClient.forumReplyVote?.findUnique === "function"
  );
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClientInstance;
  prismaConnectionString?: string;
  prismaClientCacheKey?: string;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const normalizedConnectionString =
  normalizePostgresConnectionString(connectionString);
const shouldReusePrisma =
  hasRequiredDelegates(globalForPrisma.prisma) &&
  globalForPrisma.prismaConnectionString === normalizedConnectionString &&
  globalForPrisma.prismaClientCacheKey === PRISMA_CLIENT_CACHE_KEY;

export const prisma = shouldReusePrisma
  ? globalForPrisma.prisma!
  : createPrismaClient(normalizedConnectionString);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConnectionString = normalizedConnectionString;
  globalForPrisma.prismaClientCacheKey = PRISMA_CLIENT_CACHE_KEY;
}
