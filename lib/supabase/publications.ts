import { createClient } from "@supabase/supabase-js";
import type { Publication } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const PUBLICATIONS_TABLE = "cartagena_producto_producto";

type SupabasePublicationRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  autor: string;
  programa_id: string;
  programa: {
    id: string;
    nombre: string;
  }[] | {
    id: string;
    nombre: string;
  } | null;
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

function mapRowToPublication(row: SupabasePublicationRow): Publication {
  const programa = Array.isArray(row.programa)
    ? row.programa[0]
    : row.programa;

  return {
    id: row.id,
    owner_id: row.owner_id,
    title: row.title,
    titulo: row.title,
    description: row.description,
    resumen: row.description,
    autor: row.autor,
    programa_id: row.programa_id,
    programa: programa?.nombre ?? "",
    año: row.anio,
    lineaTematica: row.linea_tematica,
    palabrasClave: row.palabras_clave ?? [],
    status: row.status,
    estado: row.status,
    storage_path: row.storage_path ?? "",
    file_name: row.file_name,
    file_size: row.file_size,
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
    .select(
      "id,owner_id,title,description,autor,programa_id,programa:cartagena_producto_programa(id,nombre),anio,linea_tematica,palabras_clave,status,storage_path,file_name,file_size,created_at,updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRowToPublication(data as SupabasePublicationRow);
}
