"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { canManageDocuments, canSuspendDocuments, isAdmin } from "@/lib/permissions";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  const navItems = [
    { label: "Inicio", href: "/" },
    { label: "Explorar", href: "/explorar" },
    ...(canManageDocuments(user) ? [{ label: "Subir REDS", href: "/subir" }] : []),
    { label: "Mi cuenta", href: "/cuenta" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Repositorio REDS Colombia"
                width={48}
                height={48}
                className="h-12 w-auto"
                style={{ width: "auto", height: "48px" }}
              />
              <div className="flex flex-col">
                <span className="text-left text-lg font-bold text-foreground">
                  Repositorio REDS Colombia
                </span>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  Recursos digitales para Colombia
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {canSuspendDocuments(user) && (
                <Link
                  href="/moderacion"
                  className={`rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    isActive("/moderacion")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  Moderación
                </Link>
              )}
              {isAdmin(user) && (
                <Link
                  href="/admin"
                  className={`rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    isActive("/admin")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              {isLoading ? (
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-base text-foreground">
                    <User className="h-4 w-4" />
                    {user.username}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </Button>
                </div>
              ) : (
                <Button asChild>
                  <Link href="/auth">Iniciar sesión</Link>
                </Button>
              )}
            </div>

            <button
              className="rounded-md p-2 text-foreground md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-base font-medium ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {canSuspendDocuments(user) && (
                <Link
                  href="/moderacion"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-base font-medium ${
                    isActive("/moderacion")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  Moderación
                </Link>
              )}
              {isAdmin(user) && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-base font-medium ${
                    isActive("/admin")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  Admin
                </Link>
              )}
              <div className="border-t border-border pt-2">
                {user ? (
                  <div className="space-y-2">
                    <span className="flex items-center gap-1 px-3 text-sm text-foreground">
                      <User className="h-4 w-4" />
                      {user.username}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={logout}
                      className="ml-3 gap-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="ml-3">
                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Iniciar sesión
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
