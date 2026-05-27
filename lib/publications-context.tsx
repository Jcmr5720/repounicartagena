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
import { canViewAllDocuments } from "@/lib/permissions";
import { supabaseConfig } from "@/lib/supabase/client";
import { useSupabase } from "@/lib/supabase/provider";
import type {
  AcademicProgram,
  Publication,
  PublicationEvaluation,
  PublicationReview,
  PublicationWorkflowAction,
  PublicationWorkflowEvent,
  PublicationWorkflowStatus,
} from "./types";

interface PublicationsContextType {
  publications: Publication[];
  programas: AcademicProgram[];
  workflowEvents: PublicationWorkflowEvent[];
  reviews: PublicationReview[];
  evaluations: PublicationEvaluation[];
  isLoading: boolean;
  addPublication: (
    publication: {
      title: string;
      description: string;
      autor: string;
      programa_id: string;
      anio?: number;
      año?: number;
      lineaTematica: string;
      palabrasClave: string[];
      file: File;
      document_id?: string;
      workflow_status?: PublicationWorkflowStatus;
    },
  ) => Promise<{ success: boolean; error?: string; documentId?: string }>;
  updatePublication: (
    id: string,
    updates: Partial<Publication>,
  ) => Promise<{ success: boolean; error?: string }>;
  deletePublication: (
    id: string,
  ) => Promise<{ success: boolean; error?: string }>;
  applyWorkflowAction: (
    id: string,
    action: PublicationWorkflowAction,
    comments?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  getPublicationById: (id: string) => Publication | undefined;
  getWorkflowEventsForPublication: (
    publicationId: string,
  ) => PublicationWorkflowEvent[];
  getLatestWorkflowCommentForPublication: (
    publicationId: string,
  ) => PublicationWorkflowEvent | undefined;
  searchPublications: (query: string) => Publication[];
  refreshPublications: () => Promise<void>;
}

const PublicationsContext = createContext<PublicationsContextType | undefined>(
  undefined,
);

const DOCUMENTS_BUCKET = "documents";
const PUBLICATIONS_TABLE = "cartagena_producto_producto";
const PROGRAMS_TABLE = "cartagena_producto_programa";
const REVIEWS_TABLE = "cartagena_publication_reviews";
const EVALUATIONS_TABLE = "cartagena_publication_evaluations";
const WORKFLOW_EVENTS_TABLE = "cartagena_publication_workflow_events";
const PUBLICATIONS_STORAGE_KEY = "reds_colombia_publications";
const LEGACY_PUBLICATIONS_STORAGE_KEY = ["repo", "sitorio_publications"].join(
  "",
);
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
  workflow_status: PublicationWorkflowStatus;
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

type SupabaseWorkflowEventRow = {
  id: string;
  publication_id: string;
  user_id: string;
  role: PublicationWorkflowEvent["role"];
  action: string;
  previous_status: PublicationWorkflowStatus | null;
  next_status: PublicationWorkflowStatus;
  comments: string | null;
  created_at: string;
};

type SupabaseReviewRow = {
  id: string;
  publication_id: string;
  reviewer_id: string;
  role: PublicationReview["role"];
  action: string;
  workflow_status: PublicationWorkflowStatus;
  comments: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseEvaluationRow = {
  id: string;
  publication_id: string;
  evaluator_id: string;
  role: PublicationEvaluation["role"];
  action: string;
  workflow_status: PublicationWorkflowStatus;
  comments: string | null;
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
    workflow_status: row.workflow_status,
    workflowStatus: row.workflow_status,
    storage_path: row.storage_path ?? "",
    file_name: row.file_name,
    file_size: row.file_size,
    pdfUrl: publicUrl,
    fechaPublicacion: row.created_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeProgramName(programa: string) {
  return programa.trim();
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

async function readResponseMessage(response: Response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.error === "string") {
      return payload.error;
    }
    if (payload && typeof payload.message === "string") {
      return payload.message;
    }
  } catch {
    // Ignore non-JSON bodies.
  }

  return response.statusText || "No se pudo completar la subida";
}

export function PublicationsProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const { user, isLoading: authLoading } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [programas, setProgramas] = useState<AcademicProgram[]>([]);
  const [workflowEvents, setWorkflowEvents] = useState<PublicationWorkflowEvent[]>(
    [],
  );
  const [reviews, setReviews] = useState<PublicationReview[]>([]);
  const [evaluations, setEvaluations] = useState<PublicationEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const programasRef = useRef<AcademicProgram[]>([]);

  const resolveProgramId = useCallback(
    async (programaNombre: string) => {
      if (!supabase) {
        return { error: "Supabase no esta disponible" };
      }

      const normalizedName = normalizeProgramName(programaNombre);

      if (!normalizedName) {
        return { error: "Debes seleccionar un programa" };
      }

      const cachedProgram = programasRef.current.find(
        (programa) => programa.nombre === normalizedName,
      );
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
        return { error: `No se encontro el programa "${normalizedName}"` };
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

  const loadWorkflowArtifacts = useCallback(
    async (publicationIds: string[]) => {
      if (!supabase || !user || publicationIds.length === 0) {
        setWorkflowEvents([]);
        setReviews([]);
        setEvaluations([]);
        return;
      }

      const [{ data: workflowData, error: workflowError }, { data: reviewData, error: reviewError }, { data: evaluationData, error: evaluationError }] =
        await Promise.all([
          supabase
            .from(WORKFLOW_EVENTS_TABLE)
            .select(
              "id,publication_id,user_id,role,action,previous_status,next_status,comments,created_at",
            )
            .in("publication_id", publicationIds)
            .order("created_at", { ascending: false }),
          supabase
            .from(REVIEWS_TABLE)
            .select(
              "id,publication_id,reviewer_id,role,action,workflow_status,comments,created_at,updated_at",
            )
            .in("publication_id", publicationIds)
            .order("created_at", { ascending: false }),
          supabase
            .from(EVALUATIONS_TABLE)
            .select(
              "id,publication_id,evaluator_id,role,action,workflow_status,comments,created_at,updated_at",
            )
            .in("publication_id", publicationIds)
            .order("created_at", { ascending: false }),
        ]);

      if (workflowError) {
        console.error("Error loading workflow events", workflowError);
        setWorkflowEvents([]);
      } else {
        setWorkflowEvents((workflowData ?? []) as SupabaseWorkflowEventRow[]);
      }

      if (reviewError) {
        console.error("Error loading reviews", reviewError);
        setReviews([]);
      } else {
        setReviews((reviewData ?? []) as SupabaseReviewRow[]);
      }

      if (evaluationError) {
        console.error("Error loading evaluations", evaluationError);
        setEvaluations([]);
      } else {
        setEvaluations((evaluationData ?? []) as SupabaseEvaluationRow[]);
      }
    },
    [supabase, user],
  );

  const loadPublications = useCallback(async () => {
    if (!supabase) {
      setPublications([]);
      setProgramas([]);
      setWorkflowEvents([]);
      setReviews([]);
      setEvaluations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    await loadPrograms();

    const shouldFetchAccessible =
      !!user || canViewAllDocuments(user) || user?.role === "estudiante";
    const baseQuery = supabase
      .from(PUBLICATIONS_TABLE)
      .select(
        "id,owner_id,title,description,autor,programa_id,programa:cartagena_producto_programa(id,nombre),anio,linea_tematica,palabras_clave,status,workflow_status,storage_path,file_name,file_size,created_at,updated_at",
      )
      .order("created_at", { ascending: false });

    const { data, error } = shouldFetchAccessible
      ? await baseQuery
      : await baseQuery.eq("status", "disponible");

    if (error) {
      console.error("Error loading publications", error);
      setPublications([]);
      setWorkflowEvents([]);
      setReviews([]);
      setEvaluations([]);
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
          const legacyPublications = JSON.parse(
            legacySaved,
          ) as LegacyPublication[];

          for (const publication of legacyPublications) {
            const programaName = normalizeProgramName(publication.programa ?? "");
            const { id: programaId } = await resolveProgramId(programaName);

            if (!programaId) {
              continue;
            }

            await supabase.from(PUBLICATIONS_TABLE).insert({
              owner_id: user.id,
              title: publication.titulo?.trim() || "Documento sin titulo",
              description: publication.resumen?.trim() || "",
              autor: publication.autor?.trim() || "",
              programa_id: programaId,
              anio: publication.anio ?? new Date().getFullYear(),
              linea_tematica: publication.lineaTematica?.trim() || "",
              palabras_clave: publication.palabrasClave ?? [],
              workflow_status:
                publication.estado === "suspendido" ? "suspendida" : "publicada",
            });
          }

          localStorage.setItem(LEGACY_IMPORT_FLAG, "true");
          localStorage.removeItem(PUBLICATIONS_STORAGE_KEY);
          localStorage.removeItem(LEGACY_PUBLICATIONS_STORAGE_KEY);
          importedLegacyDocuments = true;
        } catch (legacyError) {
          console.error("Error parsing legacy publications", legacyError);
        }
      }
    }

    const activeRows = importedLegacyDocuments
      ? ((await supabase
          .from(PUBLICATIONS_TABLE)
          .select(
            "id,owner_id,title,description,autor,programa_id,programa:cartagena_producto_programa(id,nombre),anio,linea_tematica,palabras_clave,status,workflow_status,storage_path,file_name,file_size,created_at,updated_at",
          )
          .order("created_at", { ascending: false })).data ?? []) as SupabaseDocumentRow[]
      : rows;

    const documentsWithUrls = activeRows.map((row) => {
      const publicUrl =
        row.storage_path && row.storage_path.trim()
          ? supabase.storage
              .from(DOCUMENTS_BUCKET)
              .getPublicUrl(row.storage_path).data.publicUrl
          : undefined;

      return mapRowToPublication(row, publicUrl);
    });

    setPublications(documentsWithUrls);
    await loadWorkflowArtifacts(documentsWithUrls.map((publication) => publication.id));
    setIsLoading(false);
  }, [loadPrograms, loadWorkflowArtifacts, resolveProgramId, supabase, user]);

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
    async (publication: {
      title: string;
      description: string;
      autor: string;
      programa_id: string;
      anio?: number;
      año?: number;
      lineaTematica: string;
      palabrasClave: string[];
      file: File;
      document_id?: string;
      workflow_status?: PublicationWorkflowStatus;
    }) => {
      if (!supabase) {
        return { success: false, error: "Supabase no esta disponible" };
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        return { success: false, error: sessionError.message };
      }

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        return {
          success: false,
          error: "Debes iniciar sesion para subir documentos",
        };
      }

      if (!supabaseConfig.url) {
        return { success: false, error: "Supabase no esta configurado" };
      }

      const publicationYear = publication.anio ?? publication.año;
      if (
        publicationYear === undefined ||
        publicationYear === null ||
        Number.isNaN(publicationYear)
      ) {
        return { success: false, error: "El año del documento es obligatorio" };
      }

      const formData = new FormData();
      formData.append("file", publication.file);
      formData.append("title", publication.title.trim());
      formData.append("autor", publication.autor.trim());
      formData.append("programa_id", publication.programa_id);
      formData.append("anio", publicationYear.toString());
      formData.append("linea_tematica", publication.lineaTematica.trim());
      formData.append("resumen", publication.description.trim());
      formData.append(
        "palabras_clave",
        JSON.stringify(publication.palabrasClave),
      );
      formData.append(
        "workflow_status",
        publication.workflow_status ?? "borrador",
      );

      if (publication.document_id) {
        formData.append("document_id", publication.document_id);
      }

      const response = await fetch(
        `${supabaseConfig.url}/functions/v1/cartagena_upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        return { success: false, error: await readResponseMessage(response) };
      }

      const payload = (await response.json()) as {
        document_id?: string;
      };

      await loadPublications();
      return { success: true, documentId: payload.document_id };
    },
    [loadPublications, supabase],
  );

  const updatePublication = useCallback(
    async (id: string, updates: Partial<Publication>) => {
      if (!supabase) {
        return { success: false, error: "Supabase no esta disponible" };
      }

      const payload: Record<string, unknown> = {};

      if (updates.title !== undefined) payload.title = updates.title.trim();
      if (updates.titulo !== undefined) payload.title = updates.titulo.trim();
      if (updates.description !== undefined) {
        payload.description = updates.description.trim();
      }
      if (updates.resumen !== undefined) payload.description = updates.resumen.trim();
      if (updates.autor !== undefined) payload.autor = updates.autor.trim();
      if (updates.programa_id !== undefined) {
        payload.programa_id = updates.programa_id;
      } else if (updates.programa !== undefined) {
        const { id: programaId, error: programaError } = await resolveProgramId(
          updates.programa,
        );

        if (programaError || !programaId) {
          return {
            success: false,
            error:
              programaError || "No se pudo resolver el programa seleccionado",
          };
        }

        payload.programa_id = programaId;
      }
      if (updates.año !== undefined) payload.anio = updates.año;
      if (updates.lineaTematica !== undefined) {
        payload.linea_tematica = updates.lineaTematica.trim();
      }
      if (updates.palabrasClave !== undefined) {
        payload.palabras_clave = updates.palabrasClave;
      }
      if (updates.workflow_status !== undefined) {
        payload.workflow_status = updates.workflow_status;
      }

      const { error } = await supabase
        .from(PUBLICATIONS_TABLE)
        .update(payload)
        .eq("id", id);

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
        return { success: false, error: "Supabase no esta disponible" };
      }

      const currentPublication = publications.find(
        (publication) => publication.id === id,
      );
      if (!currentPublication) {
        return { success: false, error: "La publicacion no existe" };
      }

      const { error } = await supabase
        .from(PUBLICATIONS_TABLE)
        .delete()
        .eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }

      if (currentPublication.storage_path) {
        await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .remove([currentPublication.storage_path]);
      }

      await loadPublications();
      return { success: true };
    },
    [loadPublications, publications, supabase],
  );

  const applyWorkflowAction = useCallback(
    async (
      id: string,
      action: PublicationWorkflowAction,
      comments?: string,
    ) => {
      if (!supabase) {
        return { success: false, error: "Supabase no esta disponible" };
      }

      const { error } = await supabase.rpc(
        "cartagena_apply_publication_workflow_action",
        {
          p_publication_id: id,
          p_action: action,
          p_comments: comments?.trim() || null,
        },
      );

      if (error) {
        return { success: false, error: error.message };
      }

      await loadPublications();
      return { success: true };
    },
    [loadPublications, supabase],
  );

  const getPublicationById = useCallback(
    (id: string) =>
      publications.find((publication) => publication.id === id),
    [publications],
  );

  const getWorkflowEventsForPublication = useCallback(
    (publicationId: string) =>
      workflowEvents.filter((event) => event.publication_id === publicationId),
    [workflowEvents],
  );

  const getLatestWorkflowCommentForPublication = useCallback(
    (publicationId: string) =>
      workflowEvents.find(
        (event) => event.publication_id === publicationId && event.comments,
      ),
    [workflowEvents],
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
          publication.workflow_status.toLowerCase().includes(lowerQuery) ||
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
      workflowEvents,
      reviews,
      evaluations,
      isLoading,
      addPublication,
      updatePublication,
      deletePublication,
      applyWorkflowAction,
      getPublicationById,
      getWorkflowEventsForPublication,
      getLatestWorkflowCommentForPublication,
      searchPublications,
      refreshPublications,
    }),
    [
      addPublication,
      applyWorkflowAction,
      deletePublication,
      evaluations,
      getLatestWorkflowCommentForPublication,
      getPublicationById,
      getWorkflowEventsForPublication,
      isLoading,
      programas,
      publications,
      refreshPublications,
      reviews,
      searchPublications,
      updatePublication,
      workflowEvents,
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
