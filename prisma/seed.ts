import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function seed() {
  const users = [
    {
      email: "rachel@remix.run",
      name: "Rachel",
      password: "racheliscool",
    },
    {
      email: "alice@prisma.io",
      name: "Alice",
      password: "aliceiscool",
    },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {}, // you can add fields to update if needed
      create: {
        email: u.email,
        name: u.name,
        emailVerified: true,
        password: {
          create: { hash: hashedPassword },
        },
      },
    });

    // Seed some notes for this user
    await prisma.note.createMany({
      data: [
        { title: "My first note", body: "Hello, world!", userId: user.id },
        { title: "My second note", body: "Hello, world!", userId: user.id },
      ],
    });
  }

  console.log("Database has been seeded. 🌱");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
