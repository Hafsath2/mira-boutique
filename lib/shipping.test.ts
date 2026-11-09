import { describe, expect, it } from "vitest";
import { computeShipping } from "./shipping";

describe("computeShipping", () => {
  it("renvoie le prix fixe d'une zone, avec estimation si 'à partir de'", () => {
    const zone = { mode: "FIXED", fee: 1500, perKgFee: null, isMinimum: true } as const;
    expect(computeShipping(zone, null)).toEqual({ kind: "amount", amount: 1500, isEstimate: true });
  });

  it("arrondit le poids au kilo supérieur pour le tarif au kilo", () => {
    const zone = { mode: "PER_KG", fee: null, perKgFee: 8000, isMinimum: false } as const;
    expect(computeShipping(zone, 1200)).toEqual({ kind: "amount", amount: 16000, isEstimate: true });
  });

  it("demande un devis si le poids est inconnu au tarif au kilo", () => {
    const zone = { mode: "PER_KG", fee: null, perKgFee: 8000, isMinimum: false } as const;
    expect(computeShipping(zone, null)).toEqual({ kind: "quote" });
  });

  it("demande un devis pour les pays en mode QUOTE", () => {
    const zone = { mode: "QUOTE", fee: null, perKgFee: null, isMinimum: false } as const;
    expect(computeShipping(zone, 500)).toEqual({ kind: "quote" });
  });
});
