-- CreateEnum
CREATE TYPE "ForumVoteDirection" AS ENUM ('UP', 'DOWN');

-- CreateTable
CREATE TABLE "ForumThreadVote" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" "ForumVoteDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumThreadVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReplyVote" (
    "id" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" "ForumVoteDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumReplyVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ForumThreadVote_threadId_userId_key" ON "ForumThreadVote"("threadId", "userId");

-- CreateIndex
CREATE INDEX "ForumThreadVote_threadId_idx" ON "ForumThreadVote"("threadId");

-- CreateIndex
CREATE INDEX "ForumThreadVote_userId_idx" ON "ForumThreadVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumReplyVote_replyId_userId_key" ON "ForumReplyVote"("replyId", "userId");

-- CreateIndex
CREATE INDEX "ForumReplyVote_replyId_idx" ON "ForumReplyVote"("replyId");

-- CreateIndex
CREATE INDEX "ForumReplyVote_userId_idx" ON "ForumReplyVote"("userId");

-- AddForeignKey
ALTER TABLE "ForumThreadVote" ADD CONSTRAINT "ForumThreadVote_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ForumThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumThreadVote" ADD CONSTRAINT "ForumThreadVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReplyVote" ADD CONSTRAINT "ForumReplyVote_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "ForumReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumReplyVote" ADD CONSTRAINT "ForumReplyVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;