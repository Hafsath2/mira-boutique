"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/panier"
      className="inline-flex min-h-11 items-center rounded-full border-2 border-[#111111] px-5 font-semibold"
    >
      Panier ({count})
    </Link>
  );
}
