import type { Metadata } from "next";
import { PublicationDetailPage } from "@/components/publication-detail-page";
import {
  getPublicationById,
} from "@/lib/supabase/publications";
import { getPublicationMetadataSummary } from "@/lib/publication-metadata";

interface PublicationRouteProps {
  params:
    | Promise<{
        id: string;
      }>
    | {
        id: string;
      };
}

export default async function Page({ params }: PublicationRouteProps) {
  const resolvedParams = await params;
  const publication = await getPublicationById(resolvedParams.id);

  return <PublicationDetailPage publication={publication} />;
}

export async function generateMetadata({
  params,
}: PublicationRouteProps): Promise<Metadata> {
  const resolvedParams = await params;
  const publication = await getPublicationById(resolvedParams.id);

  if (!publication) {
    return {
      title: "Publicación no encontrada | Repositorio REDS Colombia",
      description:
        "La publicación solicitada no existe o todavía no está disponible.",
    };
  }

  return {
    title: `${publication.titulo} | Repositorio REDS Colombia`,
    description: getPublicationMetadataSummary(publication),
  };
}
