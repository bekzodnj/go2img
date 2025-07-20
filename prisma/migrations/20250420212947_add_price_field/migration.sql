-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "url" TEXT,
    "thumbnailFilePath" TEXT,
    "filePath" TEXT,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "price" REAL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "material_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "material_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_material" ("authorId", "categoryId", "createdAt", "description", "filePath", "fileSize", "fileType", "id", "thumbnailFilePath", "title", "updatedAt", "url") SELECT "authorId", "categoryId", "createdAt", "description", "filePath", "fileSize", "fileType", "id", "thumbnailFilePath", "title", "updatedAt", "url" FROM "material";
DROP TABLE "material";
ALTER TABLE "new_material" RENAME TO "material";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
