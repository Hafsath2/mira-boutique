import Link from "next/link";
import { getCategories } from "@/lib/data";
import { whatsappLink } from "@/lib/site";

export default async function Home() {
  const categories = await getCategories();
  const wa = whatsappLink("Bonjour Mira Boutique, je souhaite passer commande.");

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <h1 className="font-serif text-5xl font-semibold leading-tight md:text-6xl">
            Élégance pudique, livrée chez vous
          </h1>
          <p className="max-w-md text-lg leading-relaxed">
            Abayas, hijabs, voiles et accessoires choisis avec soin. Commandez en ligne ou directement sur WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#categories" className="min-h-12 rounded-full bg-[#D6006F] px-7 py-3 font-semibold text-white">
              Voir la collection
            </a>
            <a href={wa} className="min-h-12 rounded-full bg-[#1F6B4F] px-7 py-3 font-semibold text-white">
              Commander sur WhatsApp
            </a>
          </div>
        </div>
        <div className="flex h-96 items-center justify-center rounded-2xl bg-[#FFE3F1] text-center text-sm">
          [PHOTO PRINCIPALE : à ajouter]
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-6 font-serif text-4xl font-semibold">Nos catégories</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group flex h-56 items-end rounded-2xl bg-[#FFE3F1] p-5 transition hover:bg-[#FFD0E8]"
            >
              <span className="text-xl font-semibold group-hover:text-[#D6006F]">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
