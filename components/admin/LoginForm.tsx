"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

const initial: LoginState = { error: null };
const field =
  "min-h-12 w-full rounded-lg border-2 border-[#111111] bg-white px-3";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1 font-medium">
        Mot de passe
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={field}
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg bg-[#FFE3F1] p-3 font-medium">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-full bg-[#D6006F] px-7 py-3 font-semibold text-white disabled:opacity-40"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
