import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2.106.1";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PUBLICATIONS_TABLE = "cartagena_producto_producto";
const PROGRAMS_TABLE = "cartagena_producto_programa";
const PROFILES_TABLE = "cartagena_usuario_usuario";
const BUCKET_NAME = "documents";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

type UploadPayload = {
  title: string;
  description: string;
  autor: string;
  programa_id: string;
  anio: number;
  linea_tematica: string;
  palabras_clave: string[];
  document_id?: string;
  file: File;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function parseBearerToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authHeader.slice(7).trim();
}

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseKeywords(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
  } catch {
    // Fall back to comma-separated parsing.
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createUserClient(accessToken: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function requireAuthenticatedUser(
  request: Request,
): Promise<{ user: User; client: SupabaseClient } | Response> {
  const accessToken = parseBearerToken(request);

  if (!accessToken) {
    return jsonResponse({ error: "Missing authorization token" }, 401);
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await authClient.auth.getUser(accessToken);
  if (error || !data.user) {
    return jsonResponse({ error: "Invalid or expired session" }, 401);
  }

  return {
    user: data.user,
    client: createUserClient(accessToken),
  };
}

async function getPublicationById(client: SupabaseClient, documentId: string) {
  const { data, error } = await client
    .from(PUBLICATIONS_TABLE)
    .select("id,owner_id,status,storage_path")
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    return { error: error.message } as const;
  }

  if (!data) {
    return { error: "Document not found" } as const;
  }

  return { data } as const;
}

async function handleUpload(request: Request) {
  const authResult = await requireAuthenticatedUser(request);
  if (authResult instanceof Response) {
    return authResult;
  }

  const { user, client } = authResult;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return jsonResponse({ error: "A PDF file is required" }, 400);
  }

  if (file.type && file.type !== "application/pdf") {
    return jsonResponse({ error: "Only PDF files are allowed" }, 400);
  }

  const documentId = normalizeText(formData.get("document_id")) || undefined;
  const title = normalizeText(formData.get("title"));
  const description = normalizeText(formData.get("resumen"));
  const autor = normalizeText(formData.get("autor"));
  const programaId = normalizeText(formData.get("programa_id"));
  const lineaTematica = normalizeText(formData.get("linea_tematica"));
  const anio = Number.parseInt(normalizeText(formData.get("anio")), 10);
  const palabrasClave = parseKeywords(formData.get("palabras_clave"));

  if (!title || !description || !autor || !programaId || !lineaTematica || !Number.isFinite(anio)) {
    return jsonResponse({ error: "Missing required upload fields" }, 400);
  }

  const { data: profile, error: profileError } = await client
    .from(PROFILES_TABLE)
    .select("id,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return jsonResponse({ error: profileError.message }, 400);
  }

  if (!profile) {
    return jsonResponse({ error: "User profile not found" }, 403);
  }

  if (profile.role !== "admin" && profile.role !== "estudiante") {
    return jsonResponse({ error: "You do not have permission to upload documents" }, 403);
  }

  const { data: program, error: programError } = await client
    .from(PROGRAMS_TABLE)
    .select("id,nombre")
    .eq("id", programaId)
    .maybeSingle();

  if (programError) {
    return jsonResponse({ error: programError.message }, 400);
  }

  if (!program) {
    return jsonResponse({ error: "Selected program does not exist" }, 400);
  }

  let existingDocument:
    | { id: string; owner_id: string; status: string; storage_path: string | null }
    | undefined;

  if (documentId) {
    const existingResult = await getPublicationById(client, documentId);
    if ("error" in existingResult) {
      return jsonResponse({ error: existingResult.error }, 404);
    }

    existingDocument = existingResult.data;

    if (existingDocument.owner_id !== user.id && profile.role !== "admin") {
      return jsonResponse({ error: "You do not have permission to edit this document" }, 403);
    }

    if (profile.role !== "admin" && existingDocument.status !== "disponible") {
      return jsonResponse({ error: "Only available documents can be edited by students" }, 403);
    }
  }

  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-") || "documento.pdf";
  const storagePath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

  const uploadResult = await client.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      contentType: file.type || "application/pdf",
      upsert: false,
    });

  if (uploadResult.error) {
    return jsonResponse({ error: uploadResult.error.message }, 400);
  }

  const payload: UploadPayload = {
    title,
    description,
    autor,
    programa_id: programaId,
    anio,
    linea_tematica: lineaTematica,
    palabras_clave: palabrasClave,
    document_id: documentId,
    file,
  };

  if (documentId) {
    const updateResult = await client
      .from(PUBLICATIONS_TABLE)
      .update({
        title: payload.title,
        description: payload.description,
        autor: payload.autor,
        programa_id: payload.programa_id,
        anio: payload.anio,
        linea_tematica: payload.linea_tematica,
        palabras_clave: payload.palabras_clave,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
      })
      .eq("id", documentId)
      .select("id")
      .maybeSingle();

    if (updateResult.error || !updateResult.data) {
      await client.storage.from(BUCKET_NAME).remove([storagePath]);
      return jsonResponse(
        { error: updateResult.error?.message || "Could not update document" },
        400,
      );
    }

    if (existingDocument?.storage_path) {
      const { error: removeError } = await client.storage
        .from(BUCKET_NAME)
        .remove([existingDocument.storage_path]);

      if (removeError) {
        console.error("Failed to remove previous file", removeError);
      }
    }

    return jsonResponse({
      success: true,
      document_id: documentId,
      storage_path: storagePath,
      programa_id: programaId,
      owner_id: user.id,
    });
  }

  const insertResult = await client
    .from(PUBLICATIONS_TABLE)
    .insert({
      owner_id: user.id,
      title: payload.title,
      description: payload.description,
      autor: payload.autor,
      programa_id: payload.programa_id,
      anio: payload.anio,
      linea_tematica: payload.linea_tematica,
      palabras_clave: payload.palabras_clave,
      status: "disponible",
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
    })
    .select("id")
    .maybeSingle();

  if (insertResult.error || !insertResult.data) {
    await client.storage.from(BUCKET_NAME).remove([storagePath]);
    return jsonResponse(
      { error: insertResult.error?.message || "Could not create document" },
      400,
    );
  }

  return jsonResponse({
    success: true,
    document_id: insertResult.data.id,
    storage_path: storagePath,
    programa_id: programaId,
    owner_id: user.id,
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    return await handleUpload(request);
  } catch (error) {
    console.error("cartagena_upload failed", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unexpected upload error",
      },
      500,
    );
  }
});
