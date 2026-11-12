import { createClient, getUserId } from "./supabase/server";
import type { Goal, Language, PostKind, PostWithMeta } from "./types";
import { LANGUAGES } from "./types";
import { dayKey, streakOf, weekStart } from "./utils";

export const POST_SELECT =
  "*, author:profiles(id, display_name, avatar_url), comments(count), reactions(emoji, user_id)";

export function toLang(v: unknown): Language | undefined {
  return LANGUAGES.some((l) => l.value === v) ? (v as Language) : undefined;
}

export async function getPosts(opts: {
  lang?: Language;
  kind?: PostKind;
  status?: "open" | "solved";
  authorId?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  let q = supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(opts.limit ?? 60);
  if (opts.lang) q = q.eq("language", opts.lang);
  if (opts.kind) q = q.eq("kind", opts.kind);
  if (opts.authorId) q = q.eq("author_id", opts.authorId);
  if (opts.status === "open") q = q.eq("is_solved", false);
  if (opts.status === "solved") q = q.eq("is_solved", true);
  const { data } = await q;
  return (data ?? []) as PostWithMeta[];
}

/** 내 진도: 12주 기록 수, 연속 기록일, 오늘 썼는지 */
export async function getMyProgress() {
  const userId = (await getUserId())!;
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 7 * 12);

  const [{ data: profile }, { data: posts }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, goal, weekly_target").eq("id", userId).single(),
    supabase.from("posts").select("created_at").eq("author_id", userId).gte("created_at", since.toISOString()),
  ]);

  const counts: Record<string, number> = {};
  for (const p of posts ?? []) {
    const k = dayKey(p.created_at);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  // 이번 주(월요일부터) 기록 수
  const monday = weekStart();
  const thisWeek = Object.entries(counts)
    .filter(([k]) => k >= monday)
    .reduce((a, [, n]) => a + n, 0);

  return {
    userId,
    name: (profile?.display_name as string | undefined) ?? "나",
    avatar: (profile?.avatar_url as string | null | undefined) ?? null,
    goal: (profile?.goal as string | undefined) ?? "",
    counts,
    streak: streakOf(new Set(Object.keys(counts))),
    wroteToday: Boolean(counts[dayKey(new Date())]),
    thisWeek,
    weeklyTarget: (profile?.weekly_target as number | undefined) ?? 5,
  };
}

/** 최근 7일 멤버별 기록 수 */
export async function getWeekly() {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [{ data: profiles }, { data: posts }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url"),
    supabase.from("posts").select("author_id").gte("created_at", since.toISOString()),
  ]);

  const counts = new Map<string, number>();
  for (const p of posts ?? []) counts.set(p.author_id, (counts.get(p.author_id) ?? 0) + 1);
  return (profiles ?? [])
    .map((p) => ({
      id: p.id as string,
      display_name: p.display_name as string,
      avatar_url: p.avatar_url as string | null,
      n: counts.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.n - a.n);
}

/** 한 사람의 이번 주 목표 + 지난주에 못 끝낸 목표 수 */
export async function getGoals(userId: string) {
  const supabase = await createClient();
  const [{ data: now }, { data: last }] = await Promise.all([
    supabase.from("goals").select("*").eq("user_id", userId).eq("week_start", weekStart()).order("created_at"),
    supabase.from("goals").select("*").eq("user_id", userId).eq("week_start", weekStart(new Date(), -1)).eq("done", false),
  ]);
  return { goals: (now ?? []) as Goal[], leftover: (last ?? []) as Goal[] };
}
