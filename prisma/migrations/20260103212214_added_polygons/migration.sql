/*
  Warnings:

  - You are about to drop the column `content` on the `annotation` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `annotation` table. All the data in the column will be lost.
  - Added the required column `polygons` to the `annotation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_annotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT,
    "imageWidth" TEXT,
    "imageHeight" TEXT,
    "polygons" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "annotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_annotation" ("createdAt", "id", "imageUrl", "updatedAt", "userId") SELECT "createdAt", "id", "imageUrl", "updatedAt", "userId" FROM "annotation";
DROP TABLE "annotation";
ALTER TABLE "new_annotation" RENAME TO "annotation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
