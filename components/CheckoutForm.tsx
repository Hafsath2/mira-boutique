"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { PLAN_RULES, buildSchedule } from "@/lib/echeances";
import { computeShipping } from "@/lib/shipping";
import { formatPrice } from "@/lib/site";
import { placeOrder } from "@/app/commande/actions";

type Zone = {
  country: string;
  area: string;
  mode: "FIXED" | "PER_KG" | "QUOTE";
  fee: number | null;
  perKgFee: number | null;
  isMinimum: boolean;
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
const input = "min-h-12 w-full rounded-lg border-2 border-[#111111] bg-white px-3";

export default function CheckoutForm({ zones }: { zones: Zone[] }) {
  const { items, ready, subtotal, clear } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const countries = useMemo(() => {
    const list = [...new Set(zones.map((z) => z.country))];
    return list.sort((a, b) => (a === "Bénin" ? -1 : b === "Bénin" ? 1 : a.localeCompare(b, "fr")));
  }, [zones]);

  const [country, setCountry] = useState(countries.includes("Bénin") ? "Bénin" : (countries[0] ?? ""));
  const [area, setArea] = useState("");
  const [mode, setMode] = useState<"FULL" | "INSTALLMENTS">("FULL");

  if (!ready) return <p className="px-6 py-16 text-center">Chargement…</p>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="mb-3 font-serif text-4xl font-semibold">Votre panier est vide</h1>
        <Link href="/" className="inline-block rounded-full bg-[#D6006F] px-7 py-3 font-semibold text-white">
          Voir la collection
        </Link>
      </div>
    );
  }

  const areas = zones.filter((z) => z.country === country && z.area !== "");
  const zone = zones.find((z) => z.country === country && z.area === (areas.length > 0 ? area : ""));
  const shipping = zone ? computeShipping(zone, null) : null;
  const eligible = subtotal >= PLAN_RULES.minTotal;
  const choice = eligible ? mode : "FULL";
  const schedule = buildSchedule(subtotal);
  const shippingAmount = shipping?.kind === "amount" ? shipping.amount : 0;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name") ?? ""),
      phone: String(f.get("phone") ?? ""),
      country,
      area: areas.length > 0 ? area : "",
      address: String(f.get("address") ?? ""),
      mode: choice,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    };
    startTransition(async () => {
      const res = await placeOrder(payload);
      if (res.ok) {
        clear();
        router.push(`/commande/confirmation/${res.orderId}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-6xl gap-12 px-6 py-10 md:grid-cols-[1fr_380px]">
      <section className="flex flex-col gap-4">
        <h1 className="font-serif text-5xl font-semibold">Votre commande</h1>

        <label className="flex flex-col gap-1 font-medium">
          Nom complet
          <input name="name" required autoComplete="name" className={input} />
        </label>
        <label className="flex flex-col gap-1 font-medium">
          Numéro WhatsApp
          <input name="phone" type="tel" required autoComplete="tel" placeholder="+229 ..." className={input} />
        </label>
        <label className="flex flex-col gap-1 font-medium">
          Pays
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setArea("");
            }}
            className={input}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        {areas.length > 0 && (
          <label className="flex flex-col gap-1 font-medium">
            Zone de livraison
            <select value={area} onChange={(e) => setArea(e.target.value)} required className={input}>
              <option value="">Choisissez votre zone</option>
              {areas.map((z) => (
                <option key={z.area} value={z.area}>
                  {z.area}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 font-medium">
          Adresse ou point de repère
          <textarea name="address" required rows={3} className="w-full rounded-lg border-2 border-[#111111] p-3" />
        </label>
      </section>

      <aside className="flex flex-col gap-4 self-start rounded-2xl border-2 border-[#111111] p-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-semibold">Mode de paiement</legend>
          <label className="flex items-center gap-3 rounded-lg border-2 border-[#EAD3DF] p-3">
            <input type="radio" name="mode" checked={choice === "FULL"} onChange={() => setMode("FULL")} />
            Payer en une fois
          </label>
          <label
            className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
              eligible ? "border-[#D6006F] bg-[#FFF7FB]" : "border-[#EAD3DF] opacity-50"
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
        </fieldset>

        {choice === "INSTALLMENTS" && (
          <ul className="flex flex-col gap-1 text-[15px]">
            {schedule.map((l) => (
              <li key={l.number} className="flex justify-between">
                <span>{l.number === 0 ? "À la commande" : dateFmt.format(l.dueDate)}</span>
                <strong>{formatPrice(l.amount)}</strong>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 border-t border-[#EAD3DF] pt-3">
          <div className="flex justify-between">
            <span>Articles ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Livraison</span>
            <span className="text-right">
              {!shipping
                ? "Choisissez votre zone"
                : shipping.kind === "quote"
                  ? "Confirmée par WhatsApp"
                  : `${shipping.isEstimate ? "à partir de " : ""}${formatPrice(shipping.amount)}`}
            </span>
          </div>
          <div className="flex justify-between text-lg">
            <strong>Total</strong>
            <strong>{formatPrice(subtotal + shippingAmount)}</strong>
          </div>
        </div>

        {choice === "INSTALLMENTS" && (
          <p className="text-sm">
            L’échéancier porte sur les articles. La livraison se règle à part, une fois son prix confirmé.
            Votre commande est livrée après le dernier paiement.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-[#FFE3F1] p-3 font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !zone}
          className="min-h-12 rounded-full bg-[#D6006F] px-7 py-3 font-semibold text-white disabled:opacity-40"
        >
          {pending ? "Envoi en cours…" : "Confirmer la commande"}
        </button>
      </aside>
    </form>
  );
}
