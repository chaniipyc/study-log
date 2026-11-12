import { Fire } from "@phosphor-icons/react/dist/ssr";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/skeleton";
import Link from "next/link";
import { Avatar, LangBadge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { dayKey, streakOf } from "@/lib/utils";

async function MembersPage() {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const [{ data: profileData }, { data: posts }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("posts").select("author_id, created_at").gte("created_at", since.toISOString()),
  ]);
  const profiles = (profileData ?? []) as Profile[];

  const days = new Map<string, Set<string>>();
  const week = new Map<string, number>();
  const weekAgo = new Date(since);
  weekAgo.setDate(weekAgo.getDate() + 53);
  for (const p of posts ?? []) {
    if (!days.has(p.author_id)) days.set(p.author_id, new Set());
    days.get(p.author_id)!.add(dayKey(p.created_at));
    if (new Date(p.created_at) > weekAgo) week.set(p.author_id, (week.get(p.author_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 pt-8 md:pt-12">
      <h1 className="text-2xl font-bold tracking-[-0.03em]">멤버</h1>
      <p className="mt-1 text-[15px] text-ink-2">함께 공부하는 {profiles.length}명이에요.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {profiles.map((p, i) => {
          const streak = streakOf(days.get(p.id) ?? new Set());
          return (
            <Link
              key={p.id}
              href={`/members/${p.id}`}
              className="card rise flex flex-col gap-3 p-5 transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <Avatar src={p.avatar_url} name={p.display_name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{p.display_name}</p>
                  <p className="truncate text-[13px] text-ink-2">{p.goal || "아직 목표를 정하지 않았어요"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {p.languages.map((l) => (
                  <LangBadge key={l} lang={l} />
                ))}
                <span className="ml-auto text-[13px] text-ink-3">
                  {streak > 0 && <span className="mr-2 inline-flex items-center gap-1 font-semibold text-accent"><Fire weight="fill" className="size-3.5" />{streak}일</span>}
                  이번 주 {week.get(p.id) ?? 0}개
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MembersPage />
    </Suspense>
  );
}
