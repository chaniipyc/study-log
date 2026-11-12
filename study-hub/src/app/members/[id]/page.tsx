import { Target } from "@phosphor-icons/react/dist/ssr";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/skeleton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heatmap } from "@/components/heatmap";
import { VARIANT_BY_LAYOUT } from "@/components/feed";
import { PostList } from "@/components/post-card";
import { POST_SELECT, getGoals } from "@/lib/data";
import { GoalsBoard } from "@/components/goals-board";
import { getLayout } from "@/lib/layout";
import { Avatar, EmptyState, LangBadge } from "@/components/ui";
import { signOut } from "@/app/actions";
import { createClient, getUserId } from "@/lib/supabase/server";
import type { PostWithMeta, Profile } from "@/lib/types";
import { dayKey, streakOf, weekStart } from "@/lib/utils";

async function MemberPage({ params }: PageProps<"/members/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const [userId, layout, { goals, leftover }, { data: profileData }, { data: postData }] = await Promise.all([
    getUserId(),
    getLayout(),
    getGoals(id),
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("posts").select(POST_SELECT).eq("author_id", id).order("created_at", { ascending: false }),
  ]);
  const profile = profileData as Profile | null;
  if (!profile) notFound();
  const posts = (postData ?? []) as PostWithMeta[];
  const isMe = userId === id;

  const counts: Record<string, number> = {};
  for (const p of posts) {
    const k = dayKey(p.created_at);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  const streak = streakOf(new Set(Object.keys(counts)));
  const questions = posts.filter((p) => p.kind === "question").length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-8 md:pt-12">
      <div className="rise bezel">
        <div className="bezel-inner p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <Avatar src={profile.avatar_url} name={profile.display_name} size={64} />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold tracking-[-0.03em]">{profile.display_name}</h1>
              {profile.bio && <p className="mt-1 text-[15px] text-ink-2">{profile.bio}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.languages.map((l) => (
                  <LangBadge key={l} lang={l} />
                ))}
              </div>
            </div>
            {isMe && (
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Link href="/settings" className="rounded-pill bg-surface-2 px-4 py-2 text-sm font-semibold">
                  설정
                </Link>
                <form action={signOut}>
                  <button className="px-2 py-1 text-xs text-ink-3 hover:text-ink">로그아웃</button>
                </form>
              </div>
            )}
          </div>

          {profile.goal && (
            <p className="mt-5 flex items-center gap-2 rounded-box bg-accent-soft px-4 py-3 text-sm text-accent"><Target className="size-4 shrink-0" />방학 목표 · {profile.goal}</p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <Stat label="연속 기록" value={`${streak}일`} />
            <Stat label="전체 기록" value={`${posts.length}개`} />
            <Stat label="질문" value={`${questions}개`} />
          </div>

          <div className="mt-6">
            <Heatmap counts={counts} />
          </div>
        </div>
      </div>

      <div className="card mt-4 p-6">
        <GoalsBoard
          goals={goals}
          leftover={leftover.length}
          thisWeek={Object.entries(counts).filter(([k]) => k >= weekStart()).reduce((a, [, n]) => a + n, 0)}
          weeklyTarget={profile.weekly_target ?? 5}
          editable={isMe}
        />
      </div>

      <h2 className="mt-10 text-lg font-bold tracking-[-0.02em]">기록</h2>
      <div className="mt-4 flex flex-col gap-3">
        {posts.length === 0 ? (
          <EmptyState title="아직 기록이 없어요" desc={isMe ? "오늘 배운 것 하나만 적어 봐요." : undefined} />
        ) : (
          <PostList posts={posts} variant={VARIANT_BY_LAYOUT[layout]} />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-box bg-surface-2 px-3 py-3">
      <p className="text-lg font-bold tracking-[-0.03em]">{value}</p>
      <p className="text-xs text-ink-3">{label}</p>
    </div>
  );
}

export default function Page(props: PageProps<"/members/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MemberPage {...props} />
    </Suspense>
  );
}
