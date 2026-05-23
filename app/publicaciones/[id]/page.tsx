import { PublicationDetailPage } from "@/components/publication-detail-page";
import { getPublicationById } from "@/lib/supabase/publications";

interface PublicationRouteProps {
  params?:
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
