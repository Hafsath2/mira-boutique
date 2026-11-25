import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF7FB] px-6">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border-2 border-[#111111] bg-white p-8">
        <Image
          src="/logo-mira-transparent.png"
          alt="Mira Boutique"
          width={565}
          height={220}
          className="h-16 w-auto self-start"
          priority
        />
        <h1 className="font-serif text-3xl font-semibold">
          Espace administration
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
