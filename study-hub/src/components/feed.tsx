import Link from "next/link";
import type { LayoutId } from "@/lib/appearance";
import { getPosts, toLang } from "@/lib/data";
import { getLayout } from "@/lib/layout";
import type { PostKind } from "@/lib/types";
import { LANGUAGES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PostList, type PostVariant } from "./post-card";
import { EmptyState } from "./ui";

export const VARIANT_BY_LAYOUT: Record<LayoutId, PostVariant> = {
  float: "card",
  sidebar: "row",
  timeline: "timeline",
  dashboard: "card",
  gallery: "tile",
};

/** 피드/Q&A 공통 목록. 언어 필터는 ?lang= 쿼리로, 모양은 현재 레이아웃을 따름 */
export async function Feed({
  basePath,
  lang,
  kind,
  status,
  variant,
}: {
  basePath: string;
  lang?: string;
  kind?: PostKind;
  status?: string;
  variant?: PostVariant;
}) {
  const validLang = toLang(lang);
  const st = status === "open" || status === "solved" ? status : undefined;
  const [posts, layout] = await Promise.all([getPosts({ lang: validLang, kind, status: st }), getLayout()]);
  const v = variant ?? VARIANT_BY_LAYOUT[layout];

  const href = (l?: string) => {
    const p = new URLSearchParams();
    if (l) p.set("lang", l);
    if (st) p.set("status", st);
    const s = p.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div>
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <FilterChip href={href()} active={!validLang}>
          전체
        </FilterChip>
        {LANGUAGES.map((l) => (
          <FilterChip key={l.value} href={href(l.value)} active={validLang === l.value}>
            {l.label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-4">
        {posts.length === 0 ? (
          <EmptyState
            title={kind === "question" ? "아직 질문이 없어요" : "아직 기록이 없어요"}
            desc="첫 글의 주인공이 되어 보세요."
            action={
              <Link
                href={kind === "question" ? "/write?template=question" : "/write"}
                className="btn-primary rounded-pill px-5 py-2.5 text-sm font-semibold"
              >
                {kind === "question" ? "질문하기" : "기록하기"}
              </Link>
            }
          />
        ) : (
          <PostList posts={posts} variant={v} />
        )}
      </div>
    </div>
  );
}

export function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-9 shrink-0 items-center rounded-pill px-4 text-[13px] font-semibold transition-all duration-300 ease-[var(--ease-soft)]",
        active ? "bg-primary text-on-primary" : "bg-surface text-ink-2 ring-1 ring-line hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
