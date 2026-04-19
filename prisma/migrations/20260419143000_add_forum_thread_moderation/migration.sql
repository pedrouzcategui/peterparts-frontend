DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_type
		WHERE typname = 'ForumThreadStatus'
	) THEN
		CREATE TYPE "ForumThreadStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
	END IF;
END $$;

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'ForumThread'
			AND column_name = 'moderatedAt'
	) THEN
		ALTER TABLE "ForumThread"
		ADD COLUMN "moderatedAt" TIMESTAMP(3);
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'ForumThread'
			AND column_name = 'status'
	) THEN
		ALTER TABLE "ForumThread"
		ADD COLUMN "status" "ForumThreadStatus" NOT NULL DEFAULT 'APPROVED';
	END IF;
END $$;

ALTER TABLE "ForumThread"
ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP INDEX IF EXISTS "ForumThread_slug_key";

CREATE INDEX IF NOT EXISTS "ForumThread_slug_idx" ON "ForumThread"("slug");

CREATE INDEX IF NOT EXISTS "ForumThread_status_createdAt_idx" ON "ForumThread"("status", "createdAt");