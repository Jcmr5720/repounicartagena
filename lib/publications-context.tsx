"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Publication, INITIAL_PUBLICATIONS } from "./types";

interface PublicationsContextType {
  publications: Publication[];
  isLoading: boolean;
  addPublication: (publication: Omit<Publication, "id" | "fechaPublicacion">) => void;
  updatePublication: (id: string, updates: Partial<Publication>) => void;
  deletePublication: (id: string) => void;
  getPublicationById: (id: string) => Publication | undefined;
  searchPublications: (query: string) => Publication[];
}

const PublicationsContext = createContext<PublicationsContextType | undefined>(undefined);
const PUBLICATIONS_STORAGE_KEY = "reds_colombia_publications";
const LEGACY_PUBLICATIONS_STORAGE_KEY = ["repo", "sitorio_publications"].join("");

export function PublicationsProvider({ children }: { children: ReactNode }) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPublications =
      localStorage.getItem(PUBLICATIONS_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_PUBLICATIONS_STORAGE_KEY);
    if (savedPublications) {
      try {
        setPublications(JSON.parse(savedPublications));
        localStorage.setItem(PUBLICATIONS_STORAGE_KEY, savedPublications);
        localStorage.removeItem(LEGACY_PUBLICATIONS_STORAGE_KEY);
      } catch {
        setPublications(INITIAL_PUBLICATIONS);
        localStorage.setItem(
          PUBLICATIONS_STORAGE_KEY,
          JSON.stringify(INITIAL_PUBLICATIONS)
        );
      }
    } else {
      setPublications(INITIAL_PUBLICATIONS);
      localStorage.setItem(
        PUBLICATIONS_STORAGE_KEY,
        JSON.stringify(INITIAL_PUBLICATIONS)
      );
    }
    setIsLoading(false);
  }, []);

  const savePublications = (pubs: Publication[]) => {
    setPublications(pubs);
    localStorage.setItem(PUBLICATIONS_STORAGE_KEY, JSON.stringify(pubs));
  };

  const addPublication = (publication: Omit<Publication, "id" | "fechaPublicacion">) => {
    const newPublication: Publication = {
      ...publication,
      id: Date.now().toString(),
      fechaPublicacion: new Date().toISOString().split("T")[0],
    };
    savePublications([newPublication, ...publications]);
  };

  const updatePublication = (id: string, updates: Partial<Publication>) => {
    const updatedPubs = publications.map((pub) =>
      pub.id === id ? { ...pub, ...updates } : pub
    );
    savePublications(updatedPubs);
  };

  const deletePublication = (id: string) => {
    const filteredPubs = publications.filter((pub) => pub.id !== id);
    savePublications(filteredPubs);
  };

  const getPublicationById = (id: string) => {
    return publications.find((pub) => pub.id === id);
  };

  const searchPublications = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return publications.filter(
      (pub) =>
        pub.titulo.toLowerCase().includes(lowerQuery) ||
        pub.autor.toLowerCase().includes(lowerQuery) ||
        pub.programa.toLowerCase().includes(lowerQuery) ||
        pub.palabrasClave.some((kw) => kw.toLowerCase().includes(lowerQuery)) ||
        pub.año.toString().includes(lowerQuery)
    );
  };

  return (
    <PublicationsContext.Provider
      value={{
        publications,
        isLoading,
        addPublication,
        updatePublication,
        deletePublication,
        getPublicationById,
        searchPublications,
      }}
    >
      {children}
    </PublicationsContext.Provider>
  );
}

export function usePublications() {
  const context = useContext(PublicationsContext);
  if (context === undefined) {
    throw new Error("usePublications must be used within a PublicationsProvider");
  }
  return context;
}
