"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Reset scroll manually
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
