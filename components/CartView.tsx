"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { PLAN_RULES, buildSchedule } from "@/lib/echeances";
import { formatPrice } from "@/lib/site";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
});

export default function CartView() {
  const { items, ready, remove, setQuantity, subtotal } = useCart();
  const [mode, setMode] = useState<"FULL" | "INSTALLMENTS">("FULL");

  if (!ready) return <p className="px-6 py-16 text-center">Chargement…</p>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="mb-3 font-serif text-4xl font-semibold">
          Votre panier est vide
        </h1>
        <p className="mb-6">
          Découvrez nos collections et ajoutez vos coups de cœur.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-[#D6006F] px-7 py-3 font-semibold text-white"
        >
          Voir la collection
        </Link>
      </div>
    );
  }

  const eligible = subtotal >= PLAN_RULES.minTotal;
  const choice = eligible ? mode : "FULL";
  const schedule = buildSchedule(subtotal);

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-10 md:grid-cols-[1fr_380px]">
      <section>
        <h1 className="mb-6 font-serif text-5xl font-semibold">Votre panier</h1>
        <ul className="flex flex-col gap-4">
          {items.map((i) => (
            <li
              key={i.variantId}
              className="flex gap-4 border-b border-[#EAD3DF] pb-4"
            >
              <div className="flex size-24 flex-none items-end rounded-lg bg-[#FFE3F1] p-2 text-xs">
                [Photo]
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Link
                  href={`/produits/${i.slug}`}
                  className="font-semibold hover:text-[#D6006F]"
                >
                  {i.name}
                </Link>
                <span className="text-sm">
                  {[i.size, i.color].filter(Boolean).join(" · ")}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    aria-label="Moins"
                    onClick={() => setQuantity(i.variantId, i.quantity - 1)}
                    className="size-11 rounded-lg border-2 border-[#111111]"
                  >
                    -
                  </button>
                  <span>{i.quantity}</span>
                  <button
                    aria-label="Plus"
                    disabled={i.quantity >= i.stock}
                    onClick={() => setQuantity(i.variantId, i.quantity + 1)}
                    className="size-11 rounded-lg border-2 border-[#111111] disabled:opacity-40"
                  >
                    +
                  </button>
                  <button
                    onClick={() => remove(i.variantId)}
                    className="ml-2 text-sm underline"
                  >
                    Retirer
                  </button>
                </div>
                {i.quantity >= i.stock && (
                  <span role="status" className="text-sm font-medium">
                    Quantité maximale disponible ({i.stock})
                  </span>
                )}
              </div>
              <strong>{formatPrice(i.price * i.quantity)}</strong>
            </li>
          ))}
        </ul>
      </section>

      <aside className="flex flex-col gap-4 self-start rounded-2xl border-2 border-[#111111] p-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-semibold">Mode de paiement</legend>
          <label className="flex items-center gap-3 rounded-lg border-2 border-[#EAD3DF] p-3">
            <input
              type="radio"
              name="mode"
              checked={choice === "FULL"}
              onChange={() => setMode("FULL")}
            />
            Payer en une fois
          </label>
          <label
            className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
              eligible
                ? "border-[#D6006F] bg-[#FFF7FB]"
                : "border-[#EAD3DF] opacity-50"
            }`}
          >
            <input
              type="radio"
              name="mode"
              disabled={!eligible}
              checked={choice === "INSTALLMENTS"}
              onChange={() => setMode("INSTALLMENTS")}
            />
            Payer en {PLAN_RULES.parts} fois
          </label>
          {!eligible && (
            <p className="text-sm">
              Disponible à partir de {formatPrice(PLAN_RULES.minTotal)}{" "}
              d’achats.
            </p>
          )}
        </fieldset>

        {choice === "INSTALLMENTS" && (
          <ul className="flex flex-col gap-2 text-[15px]">
            {schedule.map((l) => (
              <li key={l.number} className="flex justify-between">
                <span>
                  {l.number === 0 ? "Aujourd’hui" : dateFmt.format(l.dueDate)}
                </span>
                <strong>{formatPrice(l.amount)}</strong>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-between border-t border-[#EAD3DF] pt-3 text-lg">
          <strong>Sous-total</strong>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <p className="text-sm">
          Frais de livraison calculés à l’étape suivante.
        </p>
        <Link
          href="/commande"
          className="min-h-12 rounded-full bg-[#D6006F] px-7 py-3 text-center font-semibold text-white"
        >
          Passer la commande
        </Link>
        {choice === "INSTALLMENTS" && (
          <p className="text-sm">
            Votre commande est réservée et livrée après le dernier paiement.
          </p>
        )}
      </aside>
    </div>
  );
}
