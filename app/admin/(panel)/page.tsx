import { requireAdmin } from "@/lib/session";
import { prisma } from "@/src/lib/prisma";

export const metadata = { title: "Tableau de bord" };

const LOW_STOCK = 2;

export default async function DashboardPage() {
  const admin = await requireAdmin();

  const [pending, toShip, activeProducts, lowStock] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.variant.count({
      where: { stock: { lte: LOW_STOCK }, product: { active: true } },
    }),
  ]);

  const cards = [
    { label: "Commandes en attente de paiement", value: pending },
    { label: "Commandes payées à expédier", value: toShip },
    { label: "Produits actifs", value: activeProducts },
    {
      label: `Variantes en stock bas (${LOW_STOCK} ou moins)`,
      value: lowStock,
    },
  ];

  return (
    <main className="flex flex-col gap-8">
      <h1 className="font-serif text-4xl font-semibold">
        Bonjour {admin.name.split(" ")[0]}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-[#EAD3DF] bg-white p-5"
          >
            <div className="text-sm">{c.label}</div>
            <strong className="text-3xl">{c.value}</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
