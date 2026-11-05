import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryWithProducts } from "@/lib/data";
import { formatPrice } from "@/lib/site";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-center">Chargement…</p>}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryWithProducts(slug);
  if (!category) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 font-serif text-5xl font-semibold">{category.name}</h1>
      {category.products.length === 0 ? (
        <p>Aucun produit pour le moment. Revenez bientôt !</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {category.products.map((p) => (
            <Link key={p.id} href={`/produits/${p.slug}`} className="group flex flex-col gap-3">
              <div className="flex h-72 items-end rounded-xl bg-[#FFE3F1] p-3 text-sm">[Photo]</div>
              <div>
                <div className="font-semibold group-hover:text-[#D6006F]">{p.name}</div>
                <div>{formatPrice(p.price)}</div>
              </div>
              <span className="self-start rounded-full bg-[#D6006F] px-3 py-1 text-sm font-semibold text-white">
                ou 3 × {formatPrice(Math.ceil(p.price / 3))}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
