"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-context";
import { useSupabase } from "@/lib/supabase/provider";
import { canViewAllDocuments } from "@/lib/permissions";
import type { AcademicProgram, Document, Publication } from "./types";

interface PublicationsContextType {
  publications: Publication[];
  programas: AcademicProgram[];
  isLoading: boolean;
  addPublication: (
    publication: Omit<
      Document,
      | "id"
      | "owner_id"
      | "programa_id"
      | "status"
      | "storage_path"
      | "pdfUrl"
      | "created_at"
      | "updated_at"
    > & { file: File },
  ) => Promise<{ success: boolean; error?: string }>;
  updatePublication: (
    id: string,
    updates: Partial<Publication>,
  ) => Promise<{ success: boolean; error?: string }>;
  deletePublication: (id: string) => Promise<{ success: boolean; error?: string }>;
  getPublicationById: (id: string) => Publication | undefined;
  searchPublications: (query: string) => Publication[];
  refreshPublications: () => Promise<void>;
}

const PublicationsContext = createContext<PublicationsContextType | undefined>(
  undefined,
);

const DOCUMENTS_BUCKET = "documents";
const PUBLICATIONS_TABLE = "cartagena_producto_producto";
const PROGRAMS_TABLE = "cartagena_producto_programa";
const PUBLICATIONS_STORAGE_KEY = "reds_colombia_publications";
const LEGACY_PUBLICATIONS_STORAGE_KEY = ["repo", "sitorio_publications"].join("");
const LEGACY_IMPORT_FLAG = "reds_colombia_documents_migrated";

type SupabaseDocumentRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  autor: string;
  programa_id: string;
  programa: {
    id: string;
    nombre: string;
  }[] | null;
  anio: number;
  linea_tematica: string;
  palabras_clave: string[] | null;
  status: "disponible" | "suspendido";
  storage_path: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
};

type SupabaseProgramRow = {
  id: string;
  nombre: string;
  created_at: string;
  updated_at: string;
};

type LegacyPublication = {
  id?: string;
  titulo?: string;
  autor?: string;
  programa?: string;
  anio?: number;
  lineaTematica?: string;
  resumen?: string;
  palabrasClave?: string[];
  estado?: string;
  fechaPublicacion?: string;
};

function mapRowToPublication(
  row: SupabaseDocumentRow,
  publicUrl?: string,
): Publication {
  return {
    id: row.id,
    owner_id: row.owner_id,
    title: row.title,
    titulo: row.title,
    description: row.description,
    resumen: row.description,
    autor: row.autor,
    programa_id: row.programa_id,
    programa: row.programa?.[0]?.nombre ?? "",
    año: row.anio,
    lineaTematica: row.linea_tematica,
    palabrasClave: row.palabras_clave ?? [],
    status: row.status,
    estado: row.status,
    storage_path: row.storage_path ?? "",
    file_name: row.file_name,
    file_size: row.file_size,
    pdfUrl: publicUrl,
    fechaPublicacion: row.created_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function buildDocumentInsertPayload(
  publication: {
    title: string;
    description: string;
    autor: string;
    programa: string;
    anio: number;
    lineaTematica: string;
    palabrasClave: string[];
    status: "disponible" | "suspendido";
  },
  ownerId: string,
  programaId: string,
) {
  return {
    owner_id: ownerId,
    title: publication.title.trim(),
    description: publication.description.trim(),
    autor: publication.autor.trim(),
    programa_id: programaId,
    anio: publication.anio,
    linea_tematica: publication.lineaTematica.trim(),
    palabras_clave: publication.palabrasClave,
    status: publication.status,
    storage_path: null,
    file_name: null,
    file_size: null,
  };
}

function normalizeProgramName(programa: string) {
  return programa.trim();
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

export function PublicationsProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const { user, isLoading: authLoading } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [programas, setProgramas] = useState<AcademicProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const programasRef = useRef<AcademicProgram[]>([]);

  const resolveProgramId = useCallback(
    async (programaNombre: string) => {
      if (!supabase) {
        return { error: "Supabase no está disponible" };
      }

      const normalizedName = normalizeProgramName(programaNombre);

      if (!normalizedName) {
        return { error: "Debes seleccionar un programa" };
      }

      const cachedProgram = programasRef.current.find((programa) => programa.nombre === normalizedName);
      if (cachedProgram) {
        return { id: cachedProgram.id };
      }

      const { data, error } = await supabase
        .from(PROGRAMS_TABLE)
        .select("id,nombre,created_at,updated_at")
        .eq("nombre", normalizedName)
        .maybeSingle();

      if (error) {
        return { error: error.message };
      }

      if (!data) {
        return { error: `No se encontrÃ³ el programa "${normalizedName}"` };
      }

      return { id: (data as SupabaseProgramRow).id };
    },
    [supabase],
  );

  const loadPrograms = useCallback(async () => {
    if (!supabase) {
      setProgramas([]);
      return [];
    }

    const { data, error } = await supabase
      .from(PROGRAMS_TABLE)
      .select("id,nombre,created_at,updated_at")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error loading programs", error);
      setProgramas([]);
      return [];
    }

    const rows = ((data ?? []) as SupabaseProgramRow[]).sort((left, right) =>
      left.nombre.localeCompare(right.nombre, "es"),
    );
    programasRef.current = rows;
    setProgramas(rows);
    return rows;
  }, [supabase]);

  const loadPublications = useCallback(async () => {
    if (!supabase) {
      setPublications([]);
      setProgramas([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    await loadPrograms();

    const shouldFetchAll = canViewAllDocuments(user);
    const query = supabase
      .from(PUBLICATIONS_TABLE)
      .select(
        "id,owner_id,title,description,autor,programa_id,programa:cartagena_producto_programa(id,nombre),anio,linea_tematica,palabras_clave,status,storage_path,file_name,file_size,created_at,updated_at",
      )
      .order("created_at", { ascending: false });

    const { data, error } = shouldFetchAll
      ? await query
      : await query.eq("status", "disponible");

    if (error) {
      console.error("Error loading documents", error);
      setPublications([]);
      setIsLoading(false);
      return;
    }

    const rows = (data ?? []) as SupabaseDocumentRow[];

    let importedLegacyDocuments = false;

    if (rows.length === 0 && user?.id) {
      const migrationFlag = localStorage.getItem(LEGACY_IMPORT_FLAG);
      const legacySaved =
        localStorage.getItem(PUBLICATIONS_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_PUBLICATIONS_STORAGE_KEY);

      if (!migrationFlag && legacySaved) {
        try {
          const legacyPublications = JSON.parse(legacySaved) as LegacyPublication[];
          const rowsToInsert = await Promise.all(
            legacyPublications.map(async (publication) => {
              const programaName = normalizeProgramName(publication.programa ?? "");
              const { id: programaId, error: programaError } = await resolveProgramId(programaName);

              if (programaError || !programaId) {
                throw new Error(programaError || "No se pudo resolver el programa del documento heredado");
              }

              return buildDocumentInsertPayload(
                {
                  title: publication.titulo?.trim() || "Documento sin tÃ­tulo",
                  description: publication.resumen?.trim() || "",
                  autor: publication.autor?.trim() || "",
                  programa: programaName,
                  anio: publication.anio ?? new Date().getFullYear(),
                  lineaTematica: publication.lineaTematica?.trim() || "",
                  palabrasClave: publication.palabrasClave ?? [],
                  status:
                    publication.estado === "suspendido"
                      ? "suspendido"
                      : "disponible",
                },
                user.id,
                programaId,
              );
            }),
          );

          if (rowsToInsert.length > 0) {
            const { error: importError } = await supabase
              .from(PUBLICATIONS_TABLE)
              .insert(rowsToInsert);

            if (importError) {
              console.error("Error importing legacy documents", importError);
            } else {
              localStorage.setItem(LEGACY_IMPORT_FLAG, "true");
              localStorage.removeItem(PUBLICATIONS_STORAGE_KEY);
              localStorage.removeItem(LEGACY_PUBLICATIONS_STORAGE_KEY);
              importedLegacyDocuments = true;
            }
          }
        } catch (legacyError) {
          console.error("Error parsing legacy documents", legacyError);
        }
      }
    }

    if (importedLegacyDocuments) {
      const { data: reloaded, error: reloadError } = shouldFetchAll
        ? await supabase
            .from(PUBLICATIONS_TABLE)
            .select(
              "id,owner_id,title,description,autor,programa_id,programa:cartagena_producto_programa(id,nombre),anio,linea_tematica,palabras_clave,status,storage_path,file_name,file_size,created_at,updated_at",
            )
            .order("created_at", { ascending: false })
        : await supabase
            .from(PUBLICATIONS_TABLE)
            .select(
              "id,owner_id,title,description,autor,programa_id,programa:cartagena_producto_programa(id,nombre),anio,linea_tematica,palabras_clave,status,storage_path,file_name,file_size,created_at,updated_at",
            )
            .eq("status", "disponible")
            .order("created_at", { ascending: false });

      if (reloadError) {
        console.error("Error reloading documents after import", reloadError);
      }

      const reloadedRows = (reloaded ?? []) as SupabaseDocumentRow[];
      const reloadedDocuments = reloadedRows.map((row) => {
        const publicUrl =
          row.storage_path && row.storage_path.trim()
            ? supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(row.storage_path).data.publicUrl
            : undefined;

        return mapRowToPublication(row, publicUrl);
      });

      setPublications(reloadedDocuments);
      setIsLoading(false);
      return;
    }

    const documentsWithUrls = rows.map((row) => {
      const publicUrl =
        row.storage_path && row.storage_path.trim()
          ? supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(row.storage_path).data.publicUrl
          : undefined;

      return mapRowToPublication(row, publicUrl);
    });

    setPublications(documentsWithUrls);
    setIsLoading(false);
  }, [loadPrograms, resolveProgramId, supabase, user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadPublications();
  }, [authLoading, loadPublications]);

  const refreshPublications = useCallback(async () => {
    await loadPublications();
  }, [loadPublications]);

  const addPublication = useCallback(
      async (
        publication: Omit<
          Document,
          | "id"
          | "owner_id"
          | "programa_id"
          | "status"
          | "storage_path"
          | "pdfUrl"
          | "created_at"
          | "updated_at"
        > & { file: File },
      ) => {
      if (!supabase) {
        return { success: false, error: "Supabase no está disponible" };
      }

      if (!user) {
        return { success: false, error: "Debes iniciar sesiÃ³n para subir documentos" };
      }

      const fileExtension = publication.file.name.split(".").pop() || "pdf";
      const sanitizedName = publication.file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
      const storagePath = `${user.id}/${crypto.randomUUID()}-${sanitizedName || "documento"}.${fileExtension}`;

      const uploadResult = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(storagePath, publication.file, {
          contentType: publication.file.type || "application/pdf",
          upsert: false,
        });

      if (uploadResult.error) {
        return { success: false, error: uploadResult.error.message };
      }

      const { id: programaId, error: programaError } = await resolveProgramId(
        publication.programa,
      );

      if (programaError || !programaId) {
        await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
        return {
          success: false,
          error: programaError || "No se pudo resolver el programa seleccionado",
        };
      }

      const { error } = await supabase.from(PUBLICATIONS_TABLE).insert({
        owner_id: user.id,
        title: publication.title.trim(),
        description: publication.description.trim(),
        autor: publication.autor.trim(),
        programa_id: programaId,
        anio: publication.año,
        linea_tematica: publication.lineaTematica.trim(),
        palabras_clave: publication.palabrasClave,
        status: "disponible",
        storage_path: storagePath,
        file_name: publication.file.name,
        file_size: publication.file.size,
      });

      if (error) {
        await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
        return { success: false, error: error.message };
      }

      await loadPublications();
      return { success: true };
    },
    [loadPublications, resolveProgramId, supabase, user],
  );

  const updatePublication = useCallback(
    async (id: string, updates: Partial<Publication>) => {
      if (!supabase) {
        return { success: false, error: "Supabase no está disponible" };
      }

      const payload: Record<string, unknown> = {};

      if (updates.title !== undefined) payload.title = updates.title.trim();
      if (updates.titulo !== undefined) payload.title = updates.titulo.trim();
      if (updates.description !== undefined) payload.description = updates.description.trim();
      if (updates.resumen !== undefined) payload.description = updates.resumen.trim();
      if (updates.autor !== undefined) payload.autor = updates.autor.trim();
      if (updates.programa !== undefined) {
        const { id: programaId, error: programaError } = await resolveProgramId(
          updates.programa,
        );

        if (programaError || !programaId) {
          return {
            success: false,
            error: programaError || "No se pudo resolver el programa seleccionado",
          };
        }

        payload.programa_id = programaId;
      }
      if (updates.año !== undefined) payload.anio = updates.año;
      if (updates.lineaTematica !== undefined) {
        payload.linea_tematica = updates.lineaTematica.trim();
      }
      if (updates.palabrasClave !== undefined) payload.palabras_clave = updates.palabrasClave;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.estado !== undefined) payload.status = updates.estado;
      if (updates.storage_path !== undefined) payload.storage_path = updates.storage_path;
      if (updates.file_name !== undefined) payload.file_name = updates.file_name;
      if (updates.file_size !== undefined) payload.file_size = updates.file_size;

      const { error } = await supabase.from(PUBLICATIONS_TABLE).update(payload).eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }

      await loadPublications();
      return { success: true };
    },
    [loadPublications, resolveProgramId, supabase],
  );

  const deletePublication = useCallback(
    async (id: string) => {
      if (!supabase) {
        return { success: false, error: "Supabase no está disponible" };
      }

      const currentPublication = publications.find((publication) => publication.id === id);
      if (!currentPublication) {
        return { success: false, error: "El documento no existe" };
      }

      const { error } = await supabase.from(PUBLICATIONS_TABLE).delete().eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }

      if (currentPublication.storage_path) {
        await supabase.storage.from(DOCUMENTS_BUCKET).remove([currentPublication.storage_path]);
      }

      await loadPublications();
      return { success: true };
    },
    [loadPublications, publications, supabase],
  );

  const getPublicationById = useCallback(
    (id: string) => publications.find((publication) => publication.id === id),
    [publications],
  );

  const searchPublications = useCallback(
    (query: string) => {
      const lowerQuery = normalizeQuery(query);

      if (!lowerQuery) {
        return publications;
      }

      return publications.filter(
        (publication) =>
          publication.title.toLowerCase().includes(lowerQuery) ||
          publication.autor.toLowerCase().includes(lowerQuery) ||
          publication.programa.toLowerCase().includes(lowerQuery) ||
          publication.palabrasClave.some((keyword) =>
            keyword.toLowerCase().includes(lowerQuery),
          ) ||
          publication.año.toString().includes(lowerQuery),
      );
    },
    [publications],
  );

  const value = useMemo(
    () => ({
      publications,
      programas,
      isLoading,
      addPublication,
      updatePublication,
      deletePublication,
      getPublicationById,
      searchPublications,
      refreshPublications,
    }),
    [
      addPublication,
      deletePublication,
      getPublicationById,
      isLoading,
      publications,
      programas,
      refreshPublications,
      searchPublications,
      updatePublication,
    ],
  );

  return (
    <PublicationsContext.Provider value={value}>
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


