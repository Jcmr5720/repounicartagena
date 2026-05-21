"use client";

import { useState } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { PublicationsProvider } from "@/lib/publications-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { QuickAccessCards } from "@/components/quick-access-cards";
import { PublicationsSection } from "@/components/publications-section";
import { AccountPage } from "@/components/account-page";
import { UploadPage } from "@/components/upload-page";
import { AdminPage } from "@/components/admin-page";
import { ExplorePage } from "@/components/explore-page";
import { PublicationDetailModal } from "@/components/publication-detail-modal";
import { AuthModal } from "@/components/auth-modal";
import { Publication } from "@/lib/types";

function RepositorioApp() {
  const [currentPage, setCurrentPage] = useState("inicio");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setCurrentPage("explorar");
    }
  };

  const handleViewDetail = (publication: Publication) => {
    setSelectedPublication(publication);
    setDetailModalOpen(true);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSearchQuery("");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "cuenta":
        return <AccountPage onOpenAuthModal={() => setAuthModalOpen(true)} />;
      case "subir":
        return <UploadPage onOpenAuthModal={() => setAuthModalOpen(true)} />;
      case "admin":
        return <AdminPage />;
      case "explorar":
        return (
          <ExplorePage
            onViewDetail={handleViewDetail}
            initialSearch={searchQuery}
          />
        );
      default:
        return (
          <>
            <HeroSection onSearch={handleSearch} />
            <QuickAccessCards onNavigate={handleNavigate} />
            <PublicationsSection onViewDetail={handleViewDetail} />
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <PublicationDetailModal
        publication={selectedPublication}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <PublicationsProvider>
        <RepositorioApp />
      </PublicationsProvider>
    </AuthProvider>
  );
}
