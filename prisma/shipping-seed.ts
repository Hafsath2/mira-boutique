import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const benin = [
  { area: "Cotonou - Akpakpa", fee: 1000 },
  { area: "Cotonou - autres quartiers", fee: 1500 },
  { area: "Abomey-Calavi", fee: 1500 },
  { area: "Autres villes du Bénin", fee: 2000 },
];

// Prix confirmé par WhatsApp, selon l'agence
const quoteCountries = ["Côte d'Ivoire", "Togo", "Ghana", "Burkina Faso", "Niger", "Mali"];

async function main() {
  await prisma.shippingZone.deleteMany({ where: { country: "Bénin", area: "" } });

  for (const z of benin) {
    await prisma.shippingZone.upsert({
      where: { country_area: { country: "Bénin", area: z.area } },
      update: { fee: z.fee },
      create: { country: "Bénin", area: z.area, mode: "FIXED", fee: z.fee, isMinimum: true },
    });
  }
  for (const country of quoteCountries) {
    await prisma.shippingZone.upsert({
      where: { country_area: { country, area: "" } },
      update: {},
      create: { country, area: "", mode: "QUOTE" },
    });
  }
}

main().finally(() => prisma.$disconnect());
