"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { usePublications } from "@/lib/publications-context";
import { canUseFavorites } from "@/lib/permissions";

interface PublicationFavoriteButtonProps {
  publicationId: string;
  variant?: "ghost" | "outline";
  size?: "sm" | "icon" | "icon-sm";
  showLabel?: boolean;
  className?: string;
}

export function PublicationFavoriteButton({
  publicationId,
  variant = "ghost",
  size = "icon-sm",
  showLabel = false,
  className,
}: PublicationFavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = usePublications();

  if (!canUseFavorites(user)) {
    if (!showLabel) {
      return null;
    }

    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href="/auth">
          <Heart className="h-4 w-4" />
          Inicia sesion para guardar
        </Link>
      </Button>
    );
  }

  const favorite = isFavorite(publicationId);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => void toggleFavorite(publicationId)}
      aria-label={
        favorite ? "Quitar de favoritos" : "Agregar publicacion a favoritos"
      }
      title={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Heart
        className={`h-4 w-4 ${favorite ? "fill-current text-rose-600" : ""}`}
      />
      {showLabel ? (
        <span>{favorite ? "Quitar favorito" : "Guardar favorito"}</span>
      ) : null}
    </Button>
  );
}
