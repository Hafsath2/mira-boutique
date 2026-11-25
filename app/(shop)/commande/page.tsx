import { getShippingZones } from "@/lib/data";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata = { title: "Commande · Mira Boutique" };

export default async function CommandePage() {
  const zones = await getShippingZones();
  return (
    <CheckoutForm
      zones={zones.map((z) => ({
        country: z.country,
        area: z.area,
        mode: z.mode,
        fee: z.fee,
        perKgFee: z.perKgFee,
        isMinimum: z.isMinimum,
      }))}
    />
  );
}
