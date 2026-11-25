"use server";

import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { PLAN_RULES, buildSchedule } from "@/lib/echeances";
import { computeShipping } from "@/lib/shipping";

type Result = { ok: true; orderId: string } | { ok: false; error: string };

const fail = (error: string): Result => ({ ok: false, error });

class StockError extends Error {}

const schema = z.object({
  name: z.string().trim().min(2, "Entrez votre nom."),
  phone: z.string().trim().regex(/^\+?[0-9 ]{8,16}$/, "Numéro WhatsApp invalide."),
  country: z.string().min(1, "Choisissez votre pays."),
  area: z.string(),
  address: z.string().trim().min(5, "Entrez votre adresse ou un point de repère."),
  mode: z.enum(["FULL", "INSTALLMENTS"]),
  items: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Votre panier est vide."),
});

export async function placeOrder(input: unknown): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Données invalides.");
  const data = parsed.data;

  const zone = await prisma.shippingZone.findFirst({
    where: { country: data.country, area: data.area, active: true },
  });
  if (!zone) return fail("Cette destination n’est pas disponible. Choisissez votre zone.");

  const wanted = new Map<string, number>();
  for (const i of data.items) wanted.set(i.variantId, (wanted.get(i.variantId) ?? 0) + i.quantity);

  const variants = await prisma.variant.findMany({
    where: { id: { in: [...wanted.keys()] } },
    include: { product: true },
  });
  if (variants.length !== wanted.size) {
    return fail("Un article de votre panier n’existe plus. Retirez-le puis réessayez.");
  }

  const lines = variants.map((v) => ({
    variantId: v.id,
    name: v.product.name,
    price: v.product.price,
    quantity: wanted.get(v.id)!,
    stock: v.stock,
    active: v.product.active,
    weight: v.product.weightGrams,
  }));

  for (const l of lines) {
    if (!l.active || l.stock < l.quantity) return fail(`Stock insuffisant pour « ${l.name} ».`);
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const totalWeight = lines.some((l) => l.weight === null)
    ? null
    : lines.reduce((s, l) => s + (l.weight ?? 0) * l.quantity, 0);

  const shipping = computeShipping(zone, totalWeight);
  const shippingFee = shipping.kind === "amount" ? shipping.amount : 0;
  const shippingConfirmed = shipping.kind === "amount" && !shipping.isEstimate;

  if (data.mode === "INSTALLMENTS" && subtotal < PLAN_RULES.minTotal) {
    return fail("Le paiement en plusieurs fois n’est pas disponible pour ce montant.");
  }
  const schedule = data.mode === "INSTALLMENTS" ? buildSchedule(subtotal) : null;

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      for (const l of lines) {
        const res = await tx.variant.updateMany({
          where: { id: l.variantId, stock: { gte: l.quantity } },
          data: { stock: { decrement: l.quantity } },
        });
        if (res.count !== 1) throw new StockError(l.name);
      }

      const user = await tx.user.create({
        data: {
          name: data.name,
          phone: data.phone,
          country: data.country,
          city: data.area || null,
          address: data.address,
        },
      });

      const order = await tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING",
          paymentMode: data.mode,
          currency: "XOF",
          subtotal,
          shippingFee,
          shippingConfirmed,
          total: subtotal + shippingFee,
          items: {
            create: lines.map((l) => ({
              variantId: l.variantId,
              quantity: l.quantity,
              unitPrice: l.price,
            })),
          },
          ...(schedule
            ? {
                plan: {
                  create: {
                    installments: PLAN_RULES.parts,
                    depositPct: Math.round((schedule[0].amount / subtotal) * 100),
                    schedule: {
                      create: schedule.map((s) => ({
                        number: s.number,
                        amount: s.amount,
                        dueDate: s.dueDate,
                      })),
                    },
                  },
                },
              }
            : {}),
        },
      });
      return order.id;
    });
    return { ok: true, orderId };
  } catch (e) {
    if (e instanceof StockError) return fail(`Stock insuffisant pour « ${e.message} ».`);
    console.error("placeOrder", e);
    return fail("Une erreur est survenue. Réessayez ou écrivez-nous sur WhatsApp.");
  }
}
