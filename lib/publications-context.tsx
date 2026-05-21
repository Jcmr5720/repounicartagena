"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Publication, INITIAL_PUBLICATIONS } from "./types";

interface PublicationsContextType {
  publications: Publication[];
  addPublication: (publication: Omit<Publication, "id" | "fechaPublicacion">) => void;
  updatePublication: (id: string, updates: Partial<Publication>) => void;
  deletePublication: (id: string) => void;
  getPublicationById: (id: string) => Publication | undefined;
  searchPublications: (query: string) => Publication[];
}

const PublicationsContext = createContext<PublicationsContextType | undefined>(undefined);

export function PublicationsProvider({ children }: { children: ReactNode }) {
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    const savedPublications = localStorage.getItem("repositorio_publications");
    if (savedPublications) {
      try {
        setPublications(JSON.parse(savedPublications));
      } catch {
        setPublications(INITIAL_PUBLICATIONS);
        localStorage.setItem("repositorio_publications", JSON.stringify(INITIAL_PUBLICATIONS));
      }
    } else {
      setPublications(INITIAL_PUBLICATIONS);
      localStorage.setItem("repositorio_publications", JSON.stringify(INITIAL_PUBLICATIONS));
    }
  }, []);

  const savePublications = (pubs: Publication[]) => {
    setPublications(pubs);
    localStorage.setItem("repositorio_publications", JSON.stringify(pubs));
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
