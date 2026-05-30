import { Suspense } from "react";
import { AuthPage } from "@/components/auth-page-clean";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AuthPage />
    </Suspense>
  );
}
