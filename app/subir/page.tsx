import { Suspense } from "react";
import { UploadPage } from "@/components/upload-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"><div className="h-96 animate-pulse rounded-lg bg-muted" /></div>}>
      <UploadPage />
    </Suspense>
  );
}
