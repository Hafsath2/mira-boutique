// À vérifier : le format qui ouvre bien ton WhatsApp (avec ou sans le 01)
export const WHATSAPP_NUMBER = "22961741402";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}
