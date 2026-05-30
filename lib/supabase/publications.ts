import { createClient } from "@supabase/supabase-js";
import type { Publication } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const DOCUMENTS_BUCKET = "documents";

const PUBLICATIONS_TABLE = "cartagena_producto_producto";
const PUBLICATION_SELECT =
  "id,owner_id,title,description,autor,programa_id,linea_id,programa:cartagena_producto_programa(id,nombre),linea:cartagena_producto_linea(id,programa_id,nombre,slug),anio,linea_tematica,palabras_clave,status,workflow_status,storage_path,file_name,file_size,created_at,updated_at";

type SupabasePublicationRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  autor: string;
  programa_id: string;
  linea_id: string;
  programa: {
    id: string;
    nombre: string;
  }[] | {
    id: string;
    nombre: string;
  } | null;
  linea: {
    id: string;
    programa_id: string;
    nombre: string;
    slug: string;
  }[] | {
    id: string;
    programa_id: string;
    nombre: string;
    slug: string;
  } | null;
  anio: number;
  linea_tematica: string;
  palabras_clave: string[] | null;
  status: "disponible" | "suspendido";
  workflow_status: Publication["workflow_status"];
  storage_path: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
  updated_at: string;
};

function mapRowToPublication(row: SupabasePublicationRow): Publication {
  const programa = Array.isArray(row.programa)
    ? row.programa[0]
    : row.programa;
  const linea = Array.isArray(row.linea)
    ? row.linea[0]
    : row.linea;
  const publicUrl =
    row.storage_path && row.storage_path.trim()
      ? getSupabaseClient()?.storage.from(DOCUMENTS_BUCKET).getPublicUrl(row.storage_path).data.publicUrl
      : undefined;

  return {
    id: row.id,
    owner_id: row.owner_id,
    title: row.title,
    titulo: row.title,
    description: row.description,
    resumen: row.description,
    autor: row.autor,
    programa_id: row.programa_id,
    linea_id: row.linea_id,
    programa: programa?.nombre ?? "",
    año: row.anio,
    lineaTematica: linea?.nombre ?? row.linea_tematica,
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

function getSupabaseClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function getPublicationById(id: string): Promise<Publication | null> {
  const supabase = getSupabaseClient();

  if (!supabase || !id) {
    return null;
  }

  const { data, error } = await supabase
    .from(PUBLICATIONS_TABLE)
    .select(PUBLICATION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRowToPublication(data as SupabasePublicationRow);
}
