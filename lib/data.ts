import { cacheLife } from "next/cache";
import { prisma } from "@/src/lib/prisma";

export async function getCategories() {
  "use cache";
  cacheLife("minutes");
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryWithProducts(slug: string) {
  "use cache";
  cacheLife("minutes");
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
        include: { variants: true },
      },
    },
  });
}

export async function getProduct(slug: string) {
  "use cache";
  cacheLife("minutes");
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true, images: { orderBy: { position: "asc" } } },
  });
}
