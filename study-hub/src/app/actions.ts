"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getUserId } from "@/lib/supabase/server";
import type { Emoji, Language, PostKind } from "@/lib/types";
import { weekStart } from "@/lib/utils";

async function requireUser() {
  const userId = await getUserId();
  if (!userId) redirect("/login");
  const supabase = await createClient();
  return { supabase, userId };
}

export type PostInput = {
  kind: PostKind;
  template: string | null;
  language: Language;
  title: string;
  body: string;
  link_url: string | null;
};

function clean(input: PostInput): PostInput | string {
  const title = input.title.trim();
  if (!title) return "제목을 입력해 주세요.";
  let link_url = input.link_url?.trim() || null;
  if (input.kind === "link") {
    if (!link_url) return "블로그 글 주소를 붙여넣어 주세요.";
    if (!/^https?:\/\//i.test(link_url)) link_url = `https://${link_url}`;
  } else {
    link_url = null;
  }
  if (input.kind !== "link" && !input.body.trim()) return "내용을 조금이라도 적어 주세요.";
  return { ...input, title, link_url };
}

export async function createPost(input: PostInput): Promise<{ error: string } | void> {
  const data = clean(input);
  if (typeof data === "string") return { error: data };
  const { supabase, userId } = await requireUser();

  const { data: row, error } = await supabase
    .from("posts")
    .insert({ ...data, author_id: userId })
    .select("id")
    .single();
  if (error) return { error: "저장하지 못했어요. 잠시 후 다시 시도해 주세요." };

  revalidatePath("/", "layout");
  redirect(`/posts/${row.id}`);
}

export async function updatePost(id: number, input: PostInput): Promise<{ error: string } | void> {
  const data = clean(input);
  if (typeof data === "string") return { error: data };
  const { supabase } = await requireUser();

  const { error } = await supabase.from("posts").update(data).eq("id", id);
  if (error) return { error: "수정하지 못했어요. 잠시 후 다시 시도해 주세요." };

  revalidatePath("/", "layout");
  redirect(`/posts/${id}`);
}

export async function deletePost(id: number) {
  const { supabase } = await requireUser();
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function addComment(postId: number, body: string): Promise<{ error: string } | void> {
  const text = body.trim();
  if (!text) return { error: "내용을 입력해 주세요." };
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("comments").insert({ post_id: postId, author_id: userId, body: text });
  if (error) return { error: "댓글을 남기지 못했어요." };
  revalidatePath(`/posts/${postId}`);
}

export async function deleteComment(commentId: number, postId: number) {
  const { supabase } = await requireUser();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath(`/posts/${postId}`);
}

export async function acceptAnswer(commentId: number, postId: number) {
  const { supabase } = await requireUser();
  await supabase.rpc("accept_answer", { target_comment_id: commentId });
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/questions");
}

export async function toggleReaction(postId: number, emoji: Emoji, on: boolean) {
  const { supabase, userId } = await requireUser();
  if (on) {
    await supabase.from("reactions").upsert(
      { post_id: postId, user_id: userId, emoji },
      { onConflict: "post_id,user_id,emoji", ignoreDuplicates: true },
    );
  } else {
    await supabase.from("reactions").delete().match({ post_id: postId, user_id: userId, emoji });
  }
  revalidatePath(`/posts/${postId}`);
}

export async function updateProfile(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const languages = formData.getAll("languages").map(String);
  await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") ?? "").trim().slice(0, 40),
      bio: String(formData.get("bio") ?? "").trim().slice(0, 300),
      goal: String(formData.get("goal") ?? "").trim().slice(0, 120),
      languages,
      weekly_target: Math.min(14, Math.max(1, Number(formData.get("weekly_target")) || 5)),
    })
    .eq("id", userId);
  revalidatePath("/", "layout");
  redirect(`/members/${userId}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------- 목표 ----------
function revalidateGoals() {
  revalidatePath("/", "layout");
}

export async function addGoal(title: string): Promise<{ error: string } | void> {
  const t = title.trim().slice(0, 120);
  if (!t) return { error: "목표를 적어 주세요." };
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("goals").insert({ user_id: userId, title: t, week_start: weekStart() });
  if (error) return { error: "목표를 추가하지 못했어요." };
  revalidateGoals();
}

export async function toggleGoal(id: number, done: boolean) {
  const { supabase } = await requireUser();
  await supabase.from("goals").update({ done }).eq("id", id);
  revalidateGoals();
}

export async function deleteGoal(id: number) {
  const { supabase } = await requireUser();
  await supabase.from("goals").delete().eq("id", id);
  revalidateGoals();
}

/** 지난주에 못 끝낸 목표를 이번 주로 옮김 */
export async function carryOverGoals() {
  const { supabase, userId } = await requireUser();
  const { data } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", userId)
    .eq("week_start", weekStart(new Date(), -1))
    .eq("done", false);
  for (const g of data ?? []) {
    await supabase.from("goals").update({ week_start: weekStart() }).eq("id", g.id);
  }
  revalidateGoals();
}

export async function setWeeklyTarget(n: number) {
  const { supabase, userId } = await requireUser();
  await supabase
    .from("profiles")
    .update({ weekly_target: Math.min(14, Math.max(1, Math.round(n))) })
    .eq("id", userId);
  revalidateGoals();
}
