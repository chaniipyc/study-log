import { Suspense } from "react";
import { PageSkeleton } from "@/components/skeleton";
import { Editor } from "@/components/editor";

async function WritePage({ searchParams }: PageProps<"/write">) {
  const { template } = await searchParams;
  return <Editor initialTemplate={typeof template === "string" ? template : undefined} />;
}

export default function Page(props: PageProps<"/write">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <WritePage {...props} />
    </Suspense>
  );
}
