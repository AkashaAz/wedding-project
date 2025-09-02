"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function ConditionalNavigation() {
  const pathname = usePathname();

  // Don't show navigation on test page
  if (pathname === "/test") {
    return null;
  }

  return <Navigation />;
}
