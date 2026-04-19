-- Add the new guest role and make it the default for new accounts.
ALTER TYPE "UserRole" ADD VALUE 'GUEST';

ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'GUEST';

-- Backfill existing non-admin users based on delivered-order history.
UPDATE "User" AS "user"
SET "role" = CASE
  WHEN EXISTS (
    SELECT 1
    FROM "Order" AS "order"
    WHERE (
      "order"."userId" = "user"."id"
      OR LOWER("order"."customerEmail") = LOWER("user"."email")
    )
    AND "order"."status" = 'DELIVERED'
  ) THEN 'CUSTOMER'::"UserRole"
  ELSE 'GUEST'::"UserRole"
END
WHERE "user"."role" <> 'ADMIN';
