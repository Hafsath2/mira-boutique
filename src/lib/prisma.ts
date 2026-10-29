import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const g = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = g.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
