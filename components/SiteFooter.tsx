import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="bg-[#111111] px-6 pb-10 pt-8 text-sm text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-6">
        <div className="flex flex-col gap-2">
          <Image src="/logo-mira-blanc.png" alt="Mira Boutique" width={565} height={220} className="h-20 w-auto" />
          <span>Merci pour votre achat et votre confiance !</span>
          <span>Conçu et codé par la fondatrice</span>
        </div>
        <div className="flex flex-col gap-1">
          <span>WhatsApp : +229 61 74 14 02</span>
          <span>TikTok : mira_boutique1</span>
          <span>Instagram : mira_boutique_en ligne</span>
        </div>
      </div>
    </footer>
  );
}
