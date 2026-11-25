import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { formatPrice, whatsappLink } from "@/lib/site";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-center">Chargement…</p>}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { variant: { include: { product: true } } } },
      plan: { include: { schedule: { orderBy: { number: "asc" } } } },
    },
  });
  if (!order) notFound();

  const ref = order.id.slice(-8).toUpperCase();
  const wa = whatsappLink(`Bonjour Mira Boutique, je viens de passer la commande n° ${ref}.`);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-2 font-serif text-5xl font-semibold">Merci {order.user.name.split(" ")[0]} !</h1>
      <p className="mb-6 text-lg">
        Votre commande <strong>n° {ref}</strong> est enregistrée et vos articles sont réservés.
      </p>

      <ul className="mb-4 flex flex-col gap-2 border-y border-[#EAD3DF] py-4">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-4">
            <span>
              {i.quantity} × {i.variant.product.name}
              {[i.variant.size, i.variant.color].filter(Boolean).length > 0 &&
                ` (${[i.variant.size, i.variant.color].filter(Boolean).join(" · ")})`}
            </span>
            <strong>{formatPrice(i.unitPrice * i.quantity)}</strong>
          </li>
        ))}
      </ul>

      <div className="mb-6 flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Articles</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Livraison</span>
          <span>
            {order.shippingFee === 0
              ? "Confirmée par WhatsApp"
              : `${formatPrice(order.shippingFee)}${order.shippingConfirmed ? "" : " (à confirmer)"}`}
          </span>
        </div>
      </div>

      {order.plan && (
        <div className="mb-6 rounded-xl border-2 border-[#FF1493] bg-[#FFF7FB] p-4">
          <strong>Votre échéancier</strong>
          <ul className="mt-2 flex flex-col gap-1">
            {order.plan.schedule.map((s) => (
              <li key={s.id} className="flex justify-between">
                <span>{s.number === 0 ? "À la commande" : dateFmt.format(s.dueDate)}</span>
                <strong>{formatPrice(s.amount)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mb-6">
        Pour l’instant, nous finalisons avec vous la livraison et le paiement sur WhatsApp. Gardez bien votre
        numéro de commande.
      </p>
      <a href={wa} className="inline-block rounded-full bg-[#1F6B4F] px-7 py-3 font-semibold text-white">
        Continuer sur WhatsApp
      </a>
    </main>
  );
}
