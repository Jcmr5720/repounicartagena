"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  User as SupabaseAuthUser,
} from "@supabase/supabase-js";
import { useSupabase } from "@/lib/supabase/provider";
import type { CartagenaUsuarioUsuario, User } from "./types";

interface AuthResult {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
}

interface RegisterInput {
  nombre: string;
  email: string;
  usuario: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterInput) => Promise<AuthResult>;
  loginWithGoogle: (nextPath?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = "reds_colombia_user";
const LEGACY_USER_STORAGE_KEY = ["repo", "sitorio_user"].join("");

function normalizeText(value: string) {
  return value.trim();
}

function normalizeUsername(value: string) {
  return normalizeText(value).toLowerCase();
}

function deriveUsernameFromEmail(email?: string | null) {
  if (!email) {
    return "usuario";
  }

  const localPart = email.split("@")[0] || "usuario";
  const normalized = localPart
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "usuario";
}

function readMetadataValue(
  metadata: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function mapAuthUserToAppUser(
  authUser: SupabaseAuthUser,
  profile: CartagenaUsuarioUsuario | null,
): User {
  const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const fallbackEmail = authUser.email ?? profile?.correo ?? "";
  const derivedUsername = deriveUsernameFromEmail(fallbackEmail);
  const username =
    profile?.usuario ||
    readMetadataValue(metadata, ["usuario", "username"]) ||
    derivedUsername;
  const nombre =
    profile?.nombre ||
    readMetadataValue(metadata, ["nombre", "full_name", "name"]) ||
    username;

  return {
    nombre,
    username,
    role:
      (metadata.role === "admin" || metadata.role === "estudiante"
        ? metadata.role
        : "estudiante"),
    email: profile?.correo || fallbackEmail,
    programa: readMetadataValue(metadata, ["programa"]),
    telefono: readMetadataValue(metadata, ["telefono"]),
  };
}

function normalizeAuthError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Credenciales incorrectas";
  }

  if (lower.includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesión";
  }

  if (lower.includes("user already registered")) {
    return "Ya existe una cuenta con ese correo";
  }

  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const auth = supabase.auth;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(
    async (sessionUser: SupabaseAuthUser | null) => {
      if (!sessionUser) {
        setUser(null);
        return;
      }

      const { data, error } = await supabase
        .from("cartagena_usuario_usuario")
        .select("id,nombre,correo,usuario,created_at,updated_at")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile from Supabase", error);
      }

      setUser(mapAuthUserToAppUser(sessionUser, data ?? null));
    },
    [supabase],
  );

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await auth.getSession();

      if (!isMounted) {
        return;
      }

      await loadProfile(session?.user ?? null);
      setIsLoading(false);
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event, session) => {
      void loadProfile(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [auth, loadProfile]);

  const login = async (identifier: string, password: string): Promise<AuthResult> => {
    const trimmedIdentifier = normalizeText(identifier);
    const email = trimmedIdentifier.includes("@")
      ? trimmedIdentifier.toLowerCase()
      : "";

    if (!email) {
      return { success: false, error: "Ingresa tu correo electrónico" };
    }

    const { error } = await auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: normalizeAuthError(error.message) };
    }

    return { success: true };
  };

  const register = async ({
    nombre,
    email,
    usuario,
    password,
  }: RegisterInput): Promise<AuthResult> => {
    const normalizedNombre = normalizeText(nombre);
    const normalizedEmail = normalizeText(email).toLowerCase();
    const normalizedUsuario = normalizeUsername(usuario);

    const { data, error } = await auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
        data: {
          nombre: normalizedNombre,
          full_name: normalizedNombre,
          name: normalizedNombre,
          usuario: normalizedUsuario,
          username: normalizedUsuario,
          role: "estudiante",
        },
      },
    });

    if (error) {
      return { success: false, error: normalizeAuthError(error.message) };
    }

    if (data.session?.user) {
      await loadProfile(data.session.user);
    }

    return {
      success: true,
      needsVerification: !data.session,
    };
  };

  const loginWithGoogle = async (
    nextPath = "/",
  ): Promise<AuthResult> => {
    const redirectTo = `${window.location.origin}/auth?next=${encodeURIComponent(nextPath)}`;

    const { error } = await auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      return { success: false, error: normalizeAuthError(error.message) };
    }

    return { success: true };
  };

  const logout = async () => {
    const { error } = await auth.signOut();

    if (error) {
      console.error("Error signing out", error);
    }

    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  };

  const updateUser = async (userData: Partial<User>): Promise<AuthResult> => {
    const {
      data: { user: authUser },
      error: authUserError,
    } = await auth.getUser();

    if (authUserError || !authUser) {
      return { success: false, error: "No hay una sesión activa" };
    }

    const nextEmail = userData.email?.trim().toLowerCase();
    const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
    const nextNombre = normalizeText(
      userData.nombre ??
        user?.nombre ??
        readMetadataValue(metadata, ["nombre", "full_name", "name"]),
    );
    const nextUsuario = normalizeUsername(
      userData.username ??
        user?.username ??
        readMetadataValue(metadata, ["usuario", "username"]),
    );
    const nextPrograma = normalizeText(
      userData.programa ??
        user?.programa ??
        readMetadataValue(metadata, ["programa"]),
    );
    const nextTelefono = normalizeText(
      userData.telefono ??
        user?.telefono ??
        readMetadataValue(metadata, ["telefono"]),
    );
    const nextRole = userData.role ?? user?.role ?? "estudiante";

    const { error } = await auth.updateUser({
      email: nextEmail || undefined,
      data: {
        nombre: nextNombre || user?.nombre || nextUsuario || deriveUsernameFromEmail(authUser.email),
        full_name: nextNombre || user?.nombre || nextUsuario || deriveUsernameFromEmail(authUser.email),
        name: nextNombre || user?.nombre || nextUsuario || deriveUsernameFromEmail(authUser.email),
        usuario: nextUsuario || user?.username || deriveUsernameFromEmail(authUser.email),
        username: nextUsuario || user?.username || deriveUsernameFromEmail(authUser.email),
        programa: nextPrograma,
        telefono: nextTelefono,
        role: nextRole,
      },
    });

    if (error) {
      return { success: false, error: normalizeAuthError(error.message) };
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
