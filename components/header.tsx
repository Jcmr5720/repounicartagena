"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, LogOut, Menu, User, X } from "lucide-react";
import {
  AccessibilityControls,
  AccessibilityControlsMobile,
} from "@/components/accessibility-controls";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import {
  canAccessAdmin,
  canAccessEvaluation,
  canAccessModeration,
  canManageDocuments,
  canUseFavorites,
} from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/types";

type NavItem = {
  label: string;
  href: string;
};

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { favorites, publications } = usePublications();

  const navItems = useMemo<NavItem[]>(() => {
    return [
      { label: "Inicio", href: "/" },
      { label: "Explorar", href: "/explorar" },
      ...(canManageDocuments(user)
        ? [{ label: "Gestionar publicaciones", href: "/subir" }]
        : []),
    ];
  }, [user]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMobileMenu();
    await logout();
  };

  const roleLabel = user ? ROLE_LABELS[user.role] : "";
  const favoritePublications = useMemo(
    () =>
      favorites
        .map((favorite) =>
          publications.find(
            (publication) => publication.id === favorite.publication_id,
          ),
        )
        .filter((publication): publication is (typeof publications)[number] =>
          !!publication,
        )
        .slice(0, 6),
    [favorites, publications],
  );
  const favoriteCount = favorites.length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
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
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <AccessibilityControls />
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <>
                {canUseFavorites(user) ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Favoritos"
                        className="relative"
                      >
                        <Heart className="h-4 w-4" />
                        {favoriteCount > 0 ? (
                          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                            {favoriteCount}
                          </span>
                        ) : null}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel className="space-y-1 px-2 py-1.5">
                      <div className="text-sm font-medium text-foreground">
                          Favoritos
                        </div>
                        <div className="text-xs font-normal text-muted-foreground">
                          Tus publicaciones guardadas para acceso rapido.
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {favoritePublications.length > 0 ? (
                        favoritePublications.map((publication) => (
                          <DropdownMenuItem asChild key={publication.id}>
                            <Link
                              href={`/publicaciones/${publication.id}`}
                              className="flex flex-col items-start"
                            >
                              <span className="line-clamp-1 font-medium">
                                {publication.titulo}
                              </span>
                              <span className="line-clamp-1 text-xs text-muted-foreground">
                                {publication.autor}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-sm text-muted-foreground">
                          Aun no tienes publicaciones favoritas.
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <User className="h-4 w-4" />
                      <span className="max-w-[10rem] truncate">{user.username}</span>
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="space-y-1 px-2 py-1.5">
                      <div className="text-sm font-medium text-foreground">
                        {user.full_name}
                      </div>
                      <div className="text-xs font-normal text-muted-foreground">
                        {roleLabel}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/cuenta">Mi cuenta</Link>
                    </DropdownMenuItem>
                    {canManageDocuments(user) ? (
                      <DropdownMenuItem asChild>
                        <Link href="/subir">Gestionar recursos</Link>
                      </DropdownMenuItem>
                    ) : null}
                    {canAccessModeration(user) ? (
                      <DropdownMenuItem asChild>
                        <Link href="/moderacion">Flujo docente</Link>
                      </DropdownMenuItem>
                    ) : null}
                    {canAccessEvaluation(user) ? (
                      <DropdownMenuItem asChild>
                        <Link href="/gestion-publicaciones">Gestion publicaciones</Link>
                      </DropdownMenuItem>
                    ) : null}
                    {canAccessAdmin(user) ? (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Administrar</Link>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        void handleLogout();
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <Link href="/auth">Iniciar sesion</Link>
              </Button>
            )}
          </div>

          <button
            className="rounded-md p-2 text-foreground md:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`block w-full rounded-md px-3 py-2 text-left text-base font-medium ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <AccessibilityControlsMobile />
            <div className="border-t border-border pt-2">
              {user ? (
                <div className="space-y-3 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </div>
                {canUseFavorites(user) ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      <span>Favoritos</span>
                      {favoriteCount > 0 ? (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                          {favoriteCount}
                        </span>
                      ) : null}
                    </p>
                    {favoritePublications.length > 0 ? (
                      favoritePublications.map((publication) => (
                        <Link
                          key={publication.id}
                          href={`/publicaciones/${publication.id}`}
                          onClick={closeMobileMenu}
                          className="block rounded-md border border-border px-3 py-2 text-sm"
                        >
                          <p className="line-clamp-1 font-medium text-foreground">
                            {publication.titulo}
                          </p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {publication.autor}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Aun no tienes favoritos guardados.
                      </p>
                    )}
                  </div>
                ) : null}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                    onClick={() => void handleLogout()}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesion
                  </Button>
                </div>
              ) : (
                <Button asChild className="ml-3">
                  <Link href="/auth" onClick={closeMobileMenu}>
                    Iniciar sesion
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
