import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const categories = [
  { name: "Abayas", slug: "abayas" },
  { name: "Hijabs & voiles", slug: "hijabs-voiles" },
  { name: "Sacs", slug: "sacs" },
  { name: "Turbans", slug: "turbans" },
  { name: "Bonnets", slug: "bonnets" },
  { name: "Accessoires", slug: "accessoires" },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
}

main().finally(() => prisma.$disconnect());
