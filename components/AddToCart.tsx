"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";

type Variant = { id: string; size: string | null; color: string | null; stock: number };

export default function AddToCart({
  product,
  variants,
}: {
  product: { slug: string; name: string; price: number };
  variants: Variant[];
}) {
  const { add } = useCart();
  const [selected, setSelected] = useState<string | null>(
    variants.length === 1 && variants[0].stock > 0 ? variants[0].id : null
  );
  const [added, setAdded] = useState(false);

  const label = (v: Variant) => [v.size, v.color].filter(Boolean).join(" · ") || "Standard";
  const chosen = variants.find((v) => v.id === selected);

  function handleAdd() {
    if (!chosen) return;
    add({
      variantId: chosen.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: chosen.size,
      color: chosen.color,
      stock: chosen.stock,
    });
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 font-semibold">Choisissez votre option</div>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stock === 0}
              aria-pressed={selected === v.id}
              onClick={() => {
                setSelected(v.id);
                setAdded(false);
              }}
              className={`min-h-11 rounded-lg border-2 px-4 ${
                selected === v.id
                  ? "border-[#D6006F] bg-[#D6006F] text-white"
                  : "border-[#111111] bg-white"
              } ${v.stock === 0 ? "cursor-not-allowed line-through opacity-40" : ""}`}
            >
              {label(v)}
            </button>
          ))}
        </div>
        {chosen && <p className="mt-2 text-sm">{chosen.stock} en stock</p>}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!chosen}
        className="min-h-12 rounded-full bg-[#D6006F] px-7 py-3 font-semibold text-white disabled:opacity-40"
      >
        {chosen ? "Ajouter au panier" : "Choisissez une option"}
      </button>

      {added && (
        <p role="status" className="font-medium">
          Ajouté ✓{" "}
          <Link href="/panier" className="underline">
            Voir mon panier
          </Link>
        </p>
      )}
    </div>
  );
}
