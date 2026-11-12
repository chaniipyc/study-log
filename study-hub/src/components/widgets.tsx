import Link from "next/link";
import { ArrowRight, ChatsCircle, Fire, PencilSimpleLine, Target } from "@phosphor-icons/react/dist/ssr";
import { getMyProgress, getPosts, getWeekly } from "@/lib/data";
import { cn, timeAgo } from "@/lib/utils";
import { Heatmap } from "./heatmap";
import { Avatar, LangBadge } from "./ui";

/** 내 진도 카드: 연속 기록 + 목표 + 잔디 */
export async function ProgressCard({ bezel = true, className }: { bezel?: boolean; className?: string }) {
  const me = await getMyProgress();
  const body = (
    <>
      <p className="text-[13px] text-ink-3">{me.name}의 기록</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-[-0.04em]">{me.streak}</span>
        <span className="text-sm text-ink-2">일 연속</span>
      </div>
      <Goal goal={me.goal} />
      <div className="mt-4">
        <Heatmap counts={me.counts} />
      </div>
      {!me.wroteToday && <TilLink className="mt-4" />}
    </>
  );
  return bezel ? (
    <div className={cn("bezel", className)}>
      <div className="bezel-inner p-5">{body}</div>
    </div>
  ) : (
    <div className={cn("card p-5", className)}>{body}</div>
  );
}

/** 한 줄짜리 진도 요약 (사이드바·갤러리 상단용) */
export async function ProgressStrip() {
  const me = await getMyProgress();
  return (
    <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-pill bg-accent-soft text-accent">
          <Fire weight="fill" className="size-5" />
        </span>
        <div>
          <p className="text-lg font-bold leading-none tracking-[-0.03em]">{me.streak}일 연속</p>
          <p className="mt-1 text-xs text-ink-3">이번 주 {me.thisWeek}개 기록</p>
        </div>
      </div>
      {me.goal && (
        <p className="flex min-w-0 items-center gap-1.5 text-sm text-ink-2">
          <Target className="size-4 shrink-0 text-accent" />
          <span className="truncate">{me.goal}</span>
        </p>
      )}
      <div className="ml-auto">
        {me.wroteToday ? (
          <span className="text-sm font-semibold text-accent">오늘 기록 완료</span>
        ) : (
          <TilLink compact />
        )}
      </div>
    </div>
  );
}

export async function WeeklyCard({ className, limit }: { className?: string; limit?: number }) {
  const rows = (await getWeekly()).slice(0, limit);
  return (
    <div className={cn("card p-5", className)}>
      <p className="text-[13px] font-semibold text-ink-2">최근 7일 기록</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/members/${r.id}`} className="flex items-center gap-2.5 text-sm">
              <Avatar src={r.avatar_url} name={r.display_name} size={26} />
              <span className="flex-1 truncate">{r.display_name}</span>
              <span className={r.n > 0 ? "font-semibold text-accent" : "text-ink-3"}>{r.n}개</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function OpenQuestionsCard({ className, limit = 4 }: { className?: string; limit?: number }) {
  const posts = await getPosts({ kind: "question", status: "open", limit });
  return (
    <div className={cn("card p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-2">
          <ChatsCircle className="size-4 text-warn" /> 답변을 기다려요
        </p>
        <Link href="/questions?status=open" className="text-xs text-ink-3 hover:text-ink">
          전체
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="mt-3 text-sm text-ink-3">모든 질문이 해결됐어요.</p>
      ) : (
        <ul className="mt-2 flex flex-col">
          {posts.map((p) => (
            <li key={p.id} className="border-b border-line last:border-0">
              <Link href={`/posts/${p.id}`} className="block py-2.5">
                <p className="line-clamp-1 text-sm font-semibold hover:text-accent">{p.title}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
                  <LangBadge lang={p.language} className="!px-1.5 !py-0 !text-[10px]" />
                  {p.author?.display_name} · {timeAgo(p.created_at)} · 답변 {p.comments[0]?.count ?? 0}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Goal({ goal }: { goal: string }) {
  return goal ? (
    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2">
      <Target className="size-3.5 shrink-0 text-accent" />
      {goal}
    </p>
  ) : (
    <Link href="/settings" className="mt-1 inline-block text-[13px] text-accent underline underline-offset-2">
      방학 목표 정하기
    </Link>
  );
}

export function TilLink({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/write?template=til"
      className={cn(
        "group flex items-center justify-between gap-2 rounded-pill bg-accent-soft py-1.5 pl-4 pr-1.5 text-sm font-semibold text-accent",
        compact && "inline-flex",
        className,
      )}
    >
      {compact ? <PencilSimpleLine className="-ml-1 size-4" /> : null}
      오늘 TIL 남기기
      <span className="flex size-7 items-center justify-center rounded-pill bg-surface/70 transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5">
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}
