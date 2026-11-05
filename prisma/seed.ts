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

const demoProducts = [
  { category: "abayas", name: "Abaya démo noire", slug: "abaya-demo-noire", price: 25000,
    variants: [{ size: "M", color: "Noir", stock: 5 }, { size: "L", color: "Noir", stock: 3 }] },
  { category: "hijabs-voiles", name: "Hijab démo rose", slug: "hijab-demo-rose", price: 6000,
    variants: [{ size: null, color: "Rose", stock: 10 }] },
  { category: "sacs", name: "Sac démo", slug: "sac-demo", price: 18000,
    variants: [{ size: null, color: "Noir", stock: 4 }] },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  for (const p of demoProducts) {
    const category = await prisma.category.findUnique({ where: { slug: p.category } });
    if (!category) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: "Produit de démonstration, à remplacer par un vrai produit.",
        price: p.price,
        categoryId: category.id,
        variants: { create: p.variants },
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
