import { env } from "prisma/config";
import { PrismaClient } from "../prisma/generated/prisma/client";

import { singleton } from "./singleton.server";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: env("DATABASE_URL"),
});

// Hard-code a unique key, so we can look up the client when this module gets re-imported
export const prisma = singleton("prisma", () => new PrismaClient({ adapter }));
//prisma.$queryRaw`PRAGMA journal_mode = WAL;`
try {
  // Set journal mode to WAL and busy timeout in one go
  // await prisma.$queryRaw`PRAGMA journal_mode = WAL;`;
  // await prisma.$queryRaw`PRAGMA busy_timeout = 15000;`;

  console.log("Database configured: WAL mode and busy timeout set.");
} catch (error) {
  console.error("Error configuring database:", error);
  process.exit(1);
}
prisma.$connect();
