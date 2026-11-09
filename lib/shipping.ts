export type ZoneInfo = {
  mode: "FIXED" | "PER_KG" | "QUOTE";
  fee: number | null;
  perKgFee: number | null;
  isMinimum: boolean;
};

export type ShippingResult =
  | { kind: "amount"; amount: number; isEstimate: boolean }
  | { kind: "quote" };

// FIXED : prix de la zone. PER_KG : kilos arrondis à l'entier supérieur × prix du kilo.
// QUOTE (ou données manquantes) : prix confirmé par WhatsApp.
export function computeShipping(zone: ZoneInfo, totalWeightGrams: number | null): ShippingResult {
  if (zone.mode === "FIXED" && zone.fee !== null) {
    return { kind: "amount", amount: zone.fee, isEstimate: zone.isMinimum };
  }
  if (zone.mode === "PER_KG" && zone.perKgFee !== null && totalWeightGrams && totalWeightGrams > 0) {
    const kg = Math.ceil(totalWeightGrams / 1000);
    return { kind: "amount", amount: kg * zone.perKgFee, isEstimate: true };
  }
  return { kind: "quote" };
}
