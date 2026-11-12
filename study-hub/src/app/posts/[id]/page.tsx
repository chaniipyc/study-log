import { Suspense } from "react";
import { PageSkeleton } from "@/components/skeleton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Markdown } from "@/components/markdown";
import { Avatar, LangBadge } from "@/components/ui";
import { POST_SELECT } from "@/lib/data";
import { createClient, getUserId } from "@/lib/supabase/server";
import type { Comment, PostWithMeta } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import { hostOf, timeAgo } from "@/lib/utils";
import { Reactions } from "./reactions";
import { CommentForm, CommentActions, PostActions } from "./post-client";

async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const supabase = await createClient();
  const [userId, { data: postData }, { data: commentData }] = await Promise.all([
    getUserId(),
    supabase.from("posts").select(POST_SELECT).eq("id", postId).single(),
    supabase
      .from("comments")
      .select("*, author:profiles(id, display_name, avatar_url)")
      .eq("post_id", postId)
      .order("is_accepted", { ascending: false })
      .order("created_at", { ascending: true }),
  ]);
  const post = postData as PostWithMeta | null;
  if (!post) notFound();
  const comments = (commentData ?? []) as Comment[];
  const isMine = post.author_id === userId;
  const isQuestion = post.kind === "question";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-6 md:pt-10">
      <Link href={isQuestion ? "/questions" : "/"} className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" /> {isQuestion ? "Q&A" : "피드"}
      </Link>

      <article className="rise mt-5 bezel">
        <div className="bezel-inner p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <LangBadge lang={post.language} />
            <span className="rounded-pill bg-surface-2 px-2.5 py-0.5 text-[12px] font-semibold text-ink-2">
              {KIND_LABEL[post.kind]}
            </span>
            {isQuestion && post.is_solved && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2.5 py-0.5 text-[12px] font-semibold text-accent">
                <CheckCircle weight="fill" className="size-3.5" /> 해결됨
              </span>
            )}
          </div>

          <h1 className="mt-4 text-[1.75rem] font-bold leading-[1.3] tracking-[-0.03em]">{post.title}</h1>

          <div className="mt-4 flex items-center gap-2.5 text-sm">
            <Link href={`/members/${post.author_id}`} className="flex items-center gap-2.5">
              <Avatar src={post.author?.avatar_url} name={post.author?.display_name} size={30} />
              <span className="font-semibold">{post.author?.display_name}</span>
            </Link>
            <span className="text-ink-3">{timeAgo(post.created_at)}</span>
            {isMine && <PostActions postId={post.id} />}
          </div>

          {post.kind === "link" && post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 flex items-center justify-between gap-3 rounded-box bg-surface-2 px-5 py-4 transition-colors hover:bg-surface-hover"
            >
              <div className="min-w-0">
                <p className="text-xs text-ink-3">블로그에서 읽기</p>
                <p className="truncate font-semibold">{hostOf(post.link_url)}</p>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-surface transition-transform duration-300 ease-[var(--ease-soft)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          )}

          {post.body.trim() && (
            <div className="mt-7">
              <Markdown>{post.body}</Markdown>
            </div>
          )}

          <div className="mt-9">
            <Reactions postId={post.id} userId={userId!} reactions={post.reactions} />
          </div>
        </div>
      </article>

      <section className="mt-10">
        <h2 className="text-lg font-bold tracking-[-0.02em]">
          {isQuestion ? "답변" : "댓글"} <span className="text-ink-3">{comments.length}</span>
        </h2>

        <ul className="mt-4 flex flex-col gap-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className={
                c.is_accepted
                  ? "card p-5 ring-2 ring-accent/40"
                  : "card p-5"
              }
            >
              <div className="flex items-center gap-2 text-sm">
                <Avatar src={c.author?.avatar_url} name={c.author?.display_name} size={24} />
                <span className="font-semibold">{c.author?.display_name}</span>
                <span className="text-ink-3">{timeAgo(c.created_at)}</span>
                {c.is_accepted && (
                  <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2.5 py-0.5 text-[12px] font-semibold text-accent">
                    <CheckCircle weight="fill" className="size-3.5" /> 채택된 답변
                  </span>
                )}
                <CommentActions
                  commentId={c.id}
                  postId={post.id}
                  canDelete={c.author_id === userId}
                  canAccept={isMine && isQuestion && !c.is_accepted && c.author_id !== userId}
                />
              </div>
              <div className="mt-3 text-[15px]">
                <Markdown>{c.body}</Markdown>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <CommentForm postId={post.id} placeholder={isQuestion ? "아는 만큼만 답해도 큰 도움이 돼요" : "응원이나 질문을 남겨 보세요"} />
        </div>
      </section>
    </div>
  );
}

export default function Page(props: PageProps<"/posts/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PostPage {...props} />
    </Suspense>
  );
}
