-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryLabels" TEXT[] DEFAULT ARRAY[]::TEXT[];
