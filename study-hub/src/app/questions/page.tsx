import { Suspense } from "react";
import { PageSkeleton } from "@/components/skeleton";
import Link from "next/link";
import { Feed, FilterChip } from "@/components/feed";

async function Questions({ searchParams }: PageProps<"/questions">) {
  const { lang, status } = await searchParams;
  const st = status === "open" || status === "solved" ? status : undefined;
  const l = typeof lang === "string" ? lang : undefined;
  const href = (s?: string) => {
    const p = new URLSearchParams();
    if (l) p.set("lang", l);
    if (s) p.set("status", s);
    const q = p.toString();
    return q ? `/questions?${q}` : "/questions";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-8 md:pt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em]">Q&A</h1>
          <p className="mt-1 text-[15px] text-ink-2">모르는 건 부끄러운 게 아니에요. 편하게 물어보세요.</p>
        </div>
        <Link
          href="/write?template=question"
          className="shrink-0 rounded-pill btn-primary px-5 py-2.5 text-sm font-semibold active:scale-[0.98]"
        >
          질문하기
        </Link>
      </div>

      <div className="mt-6 flex gap-1.5">
        <FilterChip href={href()} active={!st}>
          모두
        </FilterChip>
        <FilterChip href={href("open")} active={st === "open"}>
          답변 대기
        </FilterChip>
        <FilterChip href={href("solved")} active={st === "solved"}>
          해결됨
        </FilterChip>
      </div>

      <div className="mt-3">
        <Feed basePath="/questions" kind="question" lang={l} status={st} />
      </div>
    </div>
  );
}

export default function Page(props: PageProps<"/questions">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Questions {...props} />
    </Suspense>
  );
}
