"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { useSupabase } from "@/lib/supabase/provider";
import type { Profile, UserRole, User } from "./types";

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
  updateUserRole: (userId: string, role: UserRole) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  profile: Profile | null,
): User {
  const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;
  const fallbackEmail = authUser.email ?? profile?.email ?? "";
  const derivedUsername = deriveUsernameFromEmail(fallbackEmail);
  const username =
    profile?.username ||
    readMetadataValue(metadata, ["usuario", "username"]) ||
    derivedUsername;
  const fullName =
    profile?.full_name ||
    readMetadataValue(metadata, ["nombre", "full_name", "name"]) ||
    username;

  return {
    id: profile?.id ?? authUser.id,
    email: profile?.email || fallbackEmail,
    username,
    full_name: fullName,
    role: profile?.role ?? "estudiante",
    programa: profile?.programa ?? "",
    telefono: profile?.telefono ?? "",
    created_at: profile?.created_at ?? authUser.created_at ?? new Date().toISOString(),
    updated_at: profile?.updated_at ?? new Date().toISOString(),
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

  const ensureProfile = useCallback(
    async (sessionUser: SupabaseAuthUser) => {
      const fallbackEmail = sessionUser.email ?? "";
      const metadata = (sessionUser.user_metadata ?? {}) as Record<string, unknown>;
      const fallbackUsername =
        readMetadataValue(metadata, ["usuario", "username"]) ||
        deriveUsernameFromEmail(fallbackEmail);
      const fallbackFullName =
        readMetadataValue(metadata, ["nombre", "full_name", "name"]) ||
        fallbackUsername;

      const { error } = await supabase.from("profiles").upsert(
        {
          id: sessionUser.id,
          email: fallbackEmail,
          username: fallbackUsername,
          full_name: fallbackFullName,
          role: "estudiante",
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("Error ensuring profile exists", error);
      }
    },
    [supabase],
  );

  const loadProfile = useCallback(
    async (sessionUser: SupabaseAuthUser | null) => {
      if (!sessionUser) {
        setUser(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,username,full_name,role,programa,telefono,created_at,updated_at")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile from Supabase", error);
      }

      if (!data) {
        await ensureProfile(sessionUser);
        const { data: fallbackProfile } = await supabase
          .from("profiles")
          .select("id,email,username,full_name,role,programa,telefono,created_at,updated_at")
          .eq("id", sessionUser.id)
          .maybeSingle();

        setUser(mapAuthUserToAppUser(sessionUser, fallbackProfile ?? null));
        return;
      }

      setUser(mapAuthUserToAppUser(sessionUser, data as Profile));
    },
    [ensureProfile, supabase],
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

  const login = async (
    identifier: string,
    password: string,
  ): Promise<AuthResult> => {
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
    const nextNombre = normalizeText(
      userData.full_name ??
        user?.full_name ??
        readMetadataValue((authUser.user_metadata ?? {}) as Record<string, unknown>, [
          "nombre",
          "full_name",
          "name",
        ]) ??
        user?.username ??
        deriveUsernameFromEmail(authUser.email),
    );
    const nextUsuario = normalizeUsername(
      userData.username ??
        user?.username ??
        readMetadataValue((authUser.user_metadata ?? {}) as Record<string, unknown>, [
          "usuario",
          "username",
        ]) ??
        deriveUsernameFromEmail(authUser.email),
    );
    const nextPrograma = normalizeText(
      userData.programa ??
        user?.programa ??
        readMetadataValue((authUser.user_metadata ?? {}) as Record<string, unknown>, [
          "programa",
        ]),
    );
    const nextTelefono = normalizeText(
      userData.telefono ??
        user?.telefono ??
        readMetadataValue((authUser.user_metadata ?? {}) as Record<string, unknown>, [
          "telefono",
        ]),
    );

    if (nextEmail && nextEmail !== authUser.email) {
      const { error: emailError } = await auth.updateUser({
        email: nextEmail,
      });

      if (emailError) {
        return { success: false, error: normalizeAuthError(emailError.message) };
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        email: nextEmail || authUser.email || "",
        full_name: nextNombre,
        username: nextUsuario,
        programa: nextPrograma,
        telefono: nextTelefono,
      })
      .eq("id", authUser.id);

    if (error) {
      return { success: false, error: normalizeAuthError(error.message) };
    }

    await loadProfile(authUser);

    return { success: true };
  };

  const updateUserRole = async (
    userId: string,
    role: UserRole,
  ): Promise<AuthResult> => {
    const {
      data: { user: authUser },
      error: authUserError,
    } = await auth.getUser();

    if (authUserError || !authUser) {
      return { success: false, error: "No hay una sesión activa" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      return { success: false, error: normalizeAuthError(error.message) };
    }

    if (user?.id === userId) {
      await loadProfile(authUser);
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
        updateUserRole,
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
