import { PublicationDetailPage } from "@/components/publication-detail-page";

interface PublicationRouteProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PublicationRouteProps) {
  return <PublicationDetailPage publicationId={params.id} />;
}
