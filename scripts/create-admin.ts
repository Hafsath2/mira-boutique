import "dotenv/config";
import bcrypt from "bcryptjs";
import readline from "node:readline";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

// Pose une question dans le terminal. En mode « hidden », la saisie n'est pas affichée.
function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    if (hidden) {
      const muted = rl as unknown as { _writeToOutput: (s: string) => void };
      muted._writeToOutput = (s) => {
        if (s.startsWith(question)) process.stdout.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const email = (await ask("Email de l'admin : ")).trim().toLowerCase();
  const password = await ask("Mot de passe (12 caractères minimum) : ", true);
  const confirm = await ask("Confirmez le mot de passe : ", true);

  if (!email.includes("@")) throw new Error("Email invalide.");
  if (password.length < 12)
    throw new Error("Mot de passe trop court (12 caractères minimum).");
  if (password !== confirm)
    throw new Error("Les mots de passe ne correspondent pas.");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email,
      name: "Administratrice",
      phone: "admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Compte admin prêt : ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
