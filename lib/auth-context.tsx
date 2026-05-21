"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, MOCK_USERS } from "./types";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = "reds_colombia_user";
const LEGACY_USER_STORAGE_KEY = ["repo", "sitorio_user"].join("");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser =
      localStorage.getItem(USER_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_USER_STORAGE_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        localStorage.setItem(USER_STORAGE_KEY, savedUser);
        localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string) => {
    const userEntry = MOCK_USERS[username.toLowerCase()];
    
    if (!userEntry) {
      return { success: false, error: "Usuario no encontrado" };
    }
    
    if (userEntry.password !== password) {
      return { success: false, error: "Contraseña incorrecta" };
    }

    setUser(userEntry.user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userEntry.user));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
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
