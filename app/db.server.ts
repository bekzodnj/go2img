import "dotenv/config";
import { env } from "prisma/config";
import { PrismaClient } from "../prisma/generated/prisma/client";

import { singleton } from "./singleton.server";

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: env("DATABASE_URL"),
});

// Hard-code a unique key, so we can look up the client when this module gets re-imported
export const prisma = singleton("prisma", () => new PrismaClient({ adapter }));

prisma.$connect();
