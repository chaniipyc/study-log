import { Suspense } from "react";
import { PageSkeleton } from "@/components/skeleton";
import { notFound } from "next/navigation";
import { Editor } from "@/components/editor";
import { createClient, getUserId } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

async function EditPage({ params }: PageProps<"/posts/[id]/edit">) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const supabase = await createClient();
  const [userId, { data }] = await Promise.all([
    getUserId(),
    supabase.from("posts").select("*").eq("id", postId).single(),
  ]);
  const post = data as Post | null;
  if (!post || post.author_id !== userId) notFound();

  return (
    <Editor
      postId={post.id}
      initial={{
        kind: post.kind,
        template: post.template,
        language: post.language,
        title: post.title,
        body: post.body,
        link_url: post.link_url,
      }}
    />
  );
}

export default function Page(props: PageProps<"/posts/[id]/edit">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditPage {...props} />
    </Suspense>
  );
}
