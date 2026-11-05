import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/data";
import { formatPrice, whatsappLink } from "@/lib/site";

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

  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[];
  const inStock = product.variants.some((v) => v.stock > 0);
  const part = formatPrice(Math.ceil(product.price / 3));
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
        <span className="self-start rounded-full bg-[#D6006F] px-4 py-1 text-sm font-semibold text-white">
          ou 3 × {part}
        </span>
        <p className="leading-relaxed">{product.description}</p>

        {sizes.length > 0 && (
          <div>
            <div className="mb-2 font-semibold">Tailles</div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <span key={s} className="min-w-11 rounded-lg border-2 border-[#111111] px-3 py-2 text-center">{s}</span>
              ))}
            </div>
          </div>
        )}
        {colors.length > 0 && (
          <div>
            <div className="mb-2 font-semibold">Couleurs</div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <span key={c} className="rounded-lg border-2 border-[#111111] px-3 py-2">{c}</span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border-2 border-[#FF1493] bg-[#FFF7FB] p-4">
          <strong>Payer en plusieurs fois</strong>
          <p className="mt-1 text-sm">3 paiements de {part}. Le détail des échéances arrive avec le panier.</p>
        </div>

        <p className="font-medium">{inStock ? "Disponible" : "Épuisé pour le moment"}</p>
        <a href={wa} className="min-h-12 rounded-full bg-[#1F6B4F] px-7 py-3 text-center font-semibold text-white">
          Commander sur WhatsApp
        </a>
      </div>
    </main>
  );
}
