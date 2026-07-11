/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `annotation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `library` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `material` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "annotation" DROP CONSTRAINT "annotation_userId_fkey";

-- DropForeignKey
ALTER TABLE "library" DROP CONSTRAINT "library_materialId_fkey";

-- DropForeignKey
ALTER TABLE "library" DROP CONSTRAINT "library_userId_fkey";

-- DropForeignKey
ALTER TABLE "material" DROP CONSTRAINT "material_authorId_fkey";

-- DropForeignKey
ALTER TABLE "material" DROP CONSTRAINT "material_categoryId_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Note";

-- DropTable
DROP TABLE "annotation";

-- DropTable
DROP TABLE "library";

-- DropTable
DROP TABLE "material";

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled project',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polygon" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "points" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "polygon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "image_projectId_idx" ON "image"("projectId");

-- CreateIndex
CREATE INDEX "polygon_imageId_idx" ON "polygon"("imageId");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polygon" ADD CONSTRAINT "polygon_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
