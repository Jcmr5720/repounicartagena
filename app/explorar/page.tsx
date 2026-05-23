import { ExplorePage } from "@/components/explore-page";

interface ExploreRouteProps {
  searchParams?: Promise<{
    query?: string | string[];
  }>;
}

export default async function Page({ searchParams }: ExploreRouteProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const queryParam = Array.isArray(resolvedSearchParams?.query)
    ? resolvedSearchParams?.query[0]
    : resolvedSearchParams?.query;

  return <ExplorePage initialSearch={queryParam ?? ""} />;
}
