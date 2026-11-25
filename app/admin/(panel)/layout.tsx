import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { logout } from "@/app/admin/actions";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p className="p-8">Chargement…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-2 bg-[#111111] p-6 text-white md:w-64">
        <Image
          src="/logo-mira-blanc.png"
          alt="Mira Boutique"
          width={565}
          height={220}
          className="mb-4 h-16 w-auto self-start"
        />
        <nav className="flex flex-col gap-1">
          <Link
            href="/admin"
            className="rounded-lg bg-[#D6006F] px-3 py-3 font-medium"
          >
            Tableau de bord
          </Link>
          {["Produits", "Commandes", "Échéances", "Livraison"].map((label) => (
            <span key={label} className="px-3 py-3 opacity-50">
              {label} (bientôt)
            </span>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-6 text-sm">
          <span className="break-all">{admin.email}</span>
          <form action={logout}>
            <button className="min-h-11 rounded-full border border-white px-4 font-semibold">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 bg-[#FFF7FB] p-6 md:p-10">{children}</div>
    </div>
  );
}
