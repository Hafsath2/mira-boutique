import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/data";
import { PLAN_RULES } from "@/lib/echeances";
import { formatPrice, whatsappLink } from "@/lib/site";
import AddToCart from "@/components/AddToCart";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-center">Chargement…</p>}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const canSplit = product.price >= PLAN_RULES.minTotal;
  const part = formatPrice(Math.floor(product.price / PLAN_RULES.parts));
  const wa = whatsappLink(`Bonjour Mira Boutique, je souhaite commander : ${product.name}`);

  return (
    <main className="mx-auto grid max-w-6xl gap-12 px-6 py-10 md:grid-cols-2">
      <div className="flex h-[520px] items-end rounded-2xl bg-[#FFE3F1] p-4 text-sm">[PHOTO PRODUIT]</div>

      <div className="flex flex-col gap-5">
        <Link href={`/categories/${product.category.slug}`} className="text-sm hover:text-[#D6006F]">
          ← {product.category.name}
        </Link>
        <h1 className="font-serif text-5xl font-semibold">{product.name}</h1>
        <div className="text-2xl font-semibold">{formatPrice(product.price)}</div>
        {canSplit && (
          <span className="self-start rounded-full bg-[#D6006F] px-4 py-1 text-sm font-semibold text-white">
            ou {PLAN_RULES.parts} × {part}
          </span>
        )}
        <p className="leading-relaxed">{product.description}</p>

        <AddToCart
          product={{ slug: product.slug, name: product.name, price: product.price }}
          variants={product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock }))}
        />

        {canSplit && (
          <div className="rounded-xl border-2 border-[#FF1493] bg-[#FFF7FB] p-4">
            <strong>Payer en plusieurs fois</strong>
            <p className="mt-1 text-sm">
              {PLAN_RULES.parts} paiements d’environ {part}, un toutes les {PLAN_RULES.intervalDays / 7} semaines.
              Le détail s’affiche dans le panier.
            </p>
          </div>
        )}

        <a href={wa} className="min-h-12 rounded-full bg-[#1F6B4F] px-7 py-3 text-center font-semibold text-white">
          Commander sur WhatsApp
        </a>
      </div>
    </main>
  );
}
