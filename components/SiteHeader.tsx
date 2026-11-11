import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/data";
import CartLink from "./CartLink";

export default async function SiteHeader() {
  const categories = await getCategories();

  return (
    <>
      <div className="bg-[#D6006F] px-4 py-2 text-center text-sm font-medium text-white">
        On expédie un peu partout 🌍 · Commande aussi par WhatsApp
      </div>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Mira Boutique, accueil">
          <Image src="/logo-mira-transparent.png" alt="Mira Boutique" width={565} height={220} className="h-14 w-auto" priority />
        </Link>
        <nav className="flex flex-wrap gap-6 text-[15px] font-medium">
          {categories.map((c) => (
            <Link key={c.id} href={`/categories/${c.slug}`} className="hover:text-[#D6006F]">
              {c.name}
            </Link>
          ))}
        </nav>
        <CartLink />
      </header>
    </>
  );
}
