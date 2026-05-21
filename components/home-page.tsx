"use client";

import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/hero-section";
import { QuickAccessCards } from "@/components/quick-access-cards";
import { PublicationsSection } from "@/components/publications-section";

export function HomePage() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/explorar?query=${encodeURIComponent(trimmedQuery)}`);
      return;
    }

    router.push("/explorar");
  };

  return (
    <>
      <HeroSection onSearch={handleSearch} />
      <QuickAccessCards />
      <PublicationsSection />
    </>
  );
}
