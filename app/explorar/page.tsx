import { ExplorePage } from "@/components/explore-page";

interface ExploreRouteProps {
  searchParams?: {
    query?: string | string[];
  };
}

export default function Page({ searchParams }: ExploreRouteProps) {
  const queryParam = Array.isArray(searchParams?.query)
    ? searchParams?.query[0]
    : searchParams?.query;

  return <ExplorePage initialSearch={queryParam ?? ""} />;
}
