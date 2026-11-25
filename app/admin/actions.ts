"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = { error: string | null };

const schema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(254).includes("@"),
  password: z.string().min(1).max(200),
});

const DUMMY_HASH = bcrypt.hashSync("mot-de-passe-factice", 10);

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; first: number }>();

function isBlocked(key: string) {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS) return false;
  return entry.count >= MAX_FAILURES;
}

function registerFailure(key: string) {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    failures.set(key, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const generic: LoginState = { error: "Email ou mot de passe incorrect." };

  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return generic;

  const { email, password } = parsed.data;
  if (isBlocked(email)) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || user.role !== "ADMIN" || !ok) {
    registerFailure(email);
    return generic;
  }

  failures.delete(email);
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
