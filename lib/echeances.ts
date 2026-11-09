export const PLAN_RULES = {
  parts: 3, // nombre de paiements (le premier est payé à la commande)
  intervalDays: 14, // jours entre deux paiements
  minTotal: 15000, // montant minimum pour proposer le paiement en plusieurs fois
};

export type ScheduleLine = { number: number; amount: number; dueDate: Date };

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Le 1er paiement (numéro 0) absorbe l'arrondi : la somme est toujours égale au total.
export function buildSchedule(total: number, from: Date = new Date(), rules = PLAN_RULES): ScheduleLine[] {
  const base = Math.floor(total / rules.parts);
  const first = total - base * (rules.parts - 1);
  return Array.from({ length: rules.parts }, (_, i) => ({
    number: i,
    amount: i === 0 ? first : base,
    dueDate: addDays(from, rules.intervalDays * i),
  }));
}
