import Link from "next/link";
import { ArrowUpRight, ChatCircle, CheckCircle, Fire, Lightbulb, ThumbsUp } from "@phosphor-icons/react/dist/ssr";
import type { PostWithMeta } from "@/lib/types";
import { EMOJIS, KIND_LABEL } from "@/lib/types";
import { cn, hostOf, timeAgo } from "@/lib/utils";
import { Avatar, LangBadge } from "./ui";

const REACTION_ICON = { like: ThumbsUp, idea: Lightbulb, fire: Fire };

export type PostVariant = "card" | "row" | "timeline" | "tile";

function excerpt(md: string, max = 140) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\-\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function meta(post: PostWithMeta) {
  return {
    comments: post.comments[0]?.count ?? 0,
    reactions: EMOJIS.map((e) => ({ ...e, n: post.reactions.filter((r) => r.emoji === e.value).length })).filter(
      (e) => e.n > 0,
    ),
    text: excerpt(post.body),
  };
}

function QuestionBadge({ post }: { post: PostWithMeta }) {
  if (post.kind !== "question") return null;
  return post.is_solved ? (
    <span className="inline-flex items-center gap-1 rounded-pill bg-accent-soft px-2.5 py-0.5 text-[12px] font-semibold text-accent">
      <CheckCircle weight="fill" className="size-3.5" /> 해결
    </span>
  ) : (
    <span className="inline-flex rounded-pill bg-warn-soft px-2.5 py-0.5 text-[12px] font-semibold text-warn">답변 대기</span>
  );
}

function Counts({ post, className }: { post: PostWithMeta; className?: string }) {
  const m = meta(post);
  if (m.comments === 0 && m.reactions.length === 0) return null;
  return (
    <div className={cn("flex items-center gap-3 text-[13px] text-ink-3", className)}>
      {m.reactions.map((r) => {
        const Icon = REACTION_ICON[r.value];
        return (
          <span key={r.value} className="inline-flex items-center gap-1" aria-label={`${r.label} ${r.n}`}>
            <Icon weight="fill" className="size-4" /> {r.n}
          </span>
        );
      })}
      {m.comments > 0 && (
        <span className="inline-flex items-center gap-1" aria-label={`댓글 ${m.comments}`}>
          <ChatCircle className="size-4" /> {m.comments}
        </span>
      )}
    </div>
  );
}

export function PostItem({ post, variant, index = 0 }: { post: PostWithMeta; variant: PostVariant; index?: number }) {
  const delay = { animationDelay: `${Math.min(index, 8) * 40}ms` };
  if (variant === "row") return <PostRow post={post} />;
  if (variant === "timeline") return <PostTimeline post={post} style={delay} />;
  if (variant === "tile") return <PostTile post={post} style={delay} />;
  return <PostCard post={post} style={delay} />;
}

/* ---------- 카드: 한 장씩 떠 있는 카드 ---------- */
function PostCard({ post, style }: { post: PostWithMeta; style?: React.CSSProperties }) {
  const m = meta(post);
  return (
    <Link
      href={`/posts/${post.id}`}
      className="card rise group block p-5 transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-0.5 sm:p-6"
      style={style}
    >
      <div className="flex items-center gap-2 text-[13px] text-ink-3">
        <Avatar src={post.author?.avatar_url} name={post.author?.display_name} size={22} />
        <span className="font-medium text-ink-2">{post.author?.display_name}</span>
        <span>·</span>
        <span>{timeAgo(post.created_at)}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <QuestionBadge post={post} />
          <LangBadge lang={post.language} />
        </span>
      </div>
      <h2 className="mt-3 text-[17px] font-bold leading-snug tracking-[-0.02em] transition-colors group-hover:text-accent">
        {post.title}
      </h2>
      {post.kind === "link" && post.link_url && (
        <div className="mt-3 flex items-center gap-2 rounded-box bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
          <ArrowUpRight className="size-4 shrink-0" />
          <span className="truncate">{hostOf(post.link_url)}</span>
        </div>
      )}
      {m.text && <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-2">{m.text}</p>}
      <Counts post={post} className="mt-4" />
    </Link>
  );
}

/* ---------- 행: 문서 목록처럼 촘촘하게 (사이드바형) ---------- */
function PostRow({ post }: { post: PostWithMeta }) {
  const m = meta(post);
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2/60 sm:px-5"
    >
      <LangBadge lang={post.language} className="hidden w-14 justify-center sm:inline-flex" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold group-hover:text-accent">{post.title}</span>
          {post.kind === "link" && <ArrowUpRight className="size-3.5 shrink-0 text-ink-3" />}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
          <LangBadge lang={post.language} className="!px-1.5 !py-0 !text-[10px] sm:hidden" />
          {post.author?.display_name} · {KIND_LABEL[post.kind]} · {timeAgo(post.created_at)}
        </p>
      </div>
      <div className="hidden shrink-0 sm:block">
        <QuestionBadge post={post} />
      </div>
      <span className="flex w-12 shrink-0 items-center justify-end gap-1 text-xs text-ink-3">
        {m.comments > 0 && (
          <>
            <ChatCircle className="size-3.5" /> {m.comments}
          </>
        )}
      </span>
    </Link>
  );
}

/* ---------- 타임라인: SNS 게시물처럼 프로필 사진 옆에 ---------- */
function PostTimeline({ post, style }: { post: PostWithMeta; style?: React.CSSProperties }) {
  const m = meta(post);
  return (
    <Link href={`/posts/${post.id}`} className="rise group flex gap-3 px-4 py-5 transition-colors hover:bg-surface-2/50 sm:px-5" style={style}>
      <Avatar src={post.author?.avatar_url} name={post.author?.display_name} size={42} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[14px]">
          <span className="font-bold">{post.author?.display_name}</span>
          <span className="text-ink-3">· {timeAgo(post.created_at)}</span>
          <span className="ml-auto flex items-center gap-1.5">
            <QuestionBadge post={post} />
            <LangBadge lang={post.language} />
          </span>
        </div>
        <p className="mt-1 text-[16px] font-semibold leading-snug">{post.title}</p>
        {m.text && <p className="mt-1 line-clamp-3 text-[15px] leading-relaxed text-ink-2">{m.text}</p>}
        {post.kind === "link" && post.link_url && (
          <div className="mt-3 overflow-hidden rounded-box border border-line">
            <div className="h-16 bg-accent-soft" />
            <div className="flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-ink-2">
              <ArrowUpRight className="size-4 shrink-0" />
              <span className="truncate">{hostOf(post.link_url)}</span>
            </div>
          </div>
        )}
        <Counts post={post} className="mt-3" />
      </div>
    </Link>
  );
}

/* ---------- 타일: 블로그 썸네일 카드 (갤러리형) ---------- */
const COVER: Record<string, string> = {
  c: "bg-lang-c text-lang-c-ink",
  java: "bg-lang-java text-lang-java-ink",
  sql: "bg-lang-sql text-lang-sql-ink",
  python: "bg-lang-python text-lang-python-ink",
  web: "bg-lang-web text-lang-web-ink",
  etc: "bg-lang-etc text-lang-etc-ink",
};

function PostTile({ post, style }: { post: PostWithMeta; style?: React.CSSProperties }) {
  const m = meta(post);
  const code = post.body.match(/```\w*\n([\s\S]*?)```/)?.[1]?.split("\n").slice(0, 4).join("\n");
  return (
    <Link
      href={`/posts/${post.id}`}
      className="card rise group flex flex-col overflow-hidden transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-1"
      style={style}
    >
      <div className={cn("relative h-36 overflow-hidden px-5 pt-4", COVER[post.language])}>
        <span className="text-xs font-bold tracking-wide opacity-80">
          {KIND_LABEL[post.kind]}
          {post.kind === "link" && post.link_url ? ` · ${hostOf(post.link_url)}` : ""}
        </span>
        {code ? (
          <pre className="mt-2 font-mono text-[11px] leading-5 opacity-80">{code}</pre>
        ) : (
          <p className="mt-3 line-clamp-3 font-heading text-lg font-bold leading-snug opacity-90">{post.title}</p>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-2 text-[16px] font-bold leading-snug group-hover:text-accent">{post.title}</h2>
        {m.text && <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-2">{m.text}</p>}
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-ink-3">
          <Avatar src={post.author?.avatar_url} name={post.author?.display_name} size={20} />
          <span className="font-medium text-ink-2">{post.author?.display_name}</span>
          <span>· {timeAgo(post.created_at)}</span>
          <span className="ml-auto">
            <QuestionBadge post={post} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** 목록 컨테이너: 변형마다 감싸는 모양이 다름 */
export function PostList({ posts, variant }: { posts: PostWithMeta[]; variant: PostVariant }) {
  if (variant === "row" || variant === "timeline") {
    return (
      <div className="card divide-y divide-line overflow-hidden">
        {posts.map((p, i) => (
          <PostItem key={p.id} post={p} variant={variant} index={i} />
        ))}
      </div>
    );
  }
  if (variant === "tile") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((p, i) => (
          <PostItem key={p.id} post={p} variant={variant} index={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {posts.map((p, i) => (
        <PostItem key={p.id} post={p} variant={variant} index={i} />
      ))}
    </div>
  );
}
