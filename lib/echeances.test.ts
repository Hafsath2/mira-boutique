import { describe, expect, it } from "vitest";
import { buildSchedule } from "./echeances";

describe("buildSchedule", () => {
  const start = new Date("2026-11-10T10:00:00Z");

  it("la somme des paiements est égale au total", () => {
    for (const total of [15000, 25000, 25001, 99999]) {
      const sum = buildSchedule(total, start).reduce((s, l) => s + l.amount, 0);
      expect(sum).toBe(total);
    }
  });

  it("crée 3 paiements, le premier est dû à la commande", () => {
    const lines = buildSchedule(25000, start);
    expect(lines).toHaveLength(3);
    expect(lines[0].dueDate).toEqual(start);
  });

  it("espace les paiements de 14 jours", () => {
    const lines = buildSchedule(25000, start);
    const days = (lines[1].dueDate.getTime() - lines[0].dueDate.getTime()) / 86400000;
    expect(Math.round(days)).toBe(14);
  });
});
