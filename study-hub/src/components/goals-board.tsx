"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { ArrowBendDownRight, Check, Minus, Plus, X } from "@phosphor-icons/react";
import { addGoal, carryOverGoals, deleteGoal, setWeeklyTarget, toggleGoal } from "@/app/actions";
import type { Goal } from "@/lib/types";
import { cn } from "@/lib/utils";

type Action =
  | { type: "add"; title: string }
  | { type: "toggle"; id: number; done: boolean }
  | { type: "delete"; id: number };

/** 이번 주 목표: 주간 기록 횟수 + 할 일 체크리스트 */
export function GoalsBoard({
  goals,
  leftover,
  thisWeek,
  weeklyTarget,
  editable = true,
}: {
  goals: Goal[];
  leftover: number;
  thisWeek: number;
  weeklyTarget: number;
  editable?: boolean;
}) {
  const [, start] = useTransition();
  const [draft, setDraft] = useState("");
  const [target, setTarget] = useOptimistic(weeklyTarget);
  const inputRef = useRef<HTMLInputElement>(null);
  const [list, apply] = useOptimistic(goals, (state: Goal[], a: Action) => {
    if (a.type === "add")
      return [
        ...state,
        { id: -Date.now(), user_id: "", title: a.title, done: false, week_start: "", created_at: "" },
      ];
    if (a.type === "toggle") return state.map((g) => (g.id === a.id ? { ...g, done: a.done } : g));
    return state.filter((g) => g.id !== a.id);
  });

  const done = list.filter((g) => g.done).length;
  const pct = Math.min(100, Math.round((thisWeek / target) * 100));

  function submit() {
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    start(async () => {
      apply({ type: "add", title: t });
      await addGoal(t);
    });
  }

  function changeTarget(n: number) {
    const next = Math.min(14, Math.max(1, n));
    start(async () => {
      setTarget(next);
      await setWeeklyTarget(next);
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* 주간 기록 목표 */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-ink-3">이번 주 기록</p>
          <p className="mt-0.5 text-2xl font-bold tracking-[-0.03em]">
            {thisWeek}
            <span className="text-base font-semibold text-ink-3"> / {target}회</span>
          </p>
        </div>
        {editable && (
          <div className="flex items-center gap-1 rounded-pill bg-surface-2 p-1" aria-label="주간 기록 목표 횟수">
            <button
              type="button"
              onClick={() => changeTarget(target - 1)}
              aria-label="목표 횟수 줄이기"
              className="flex size-8 items-center justify-center rounded-pill hover:bg-surface"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-14 text-center text-xs font-semibold text-ink-2">주 {target}회</span>
            <button
              type="button"
              onClick={() => changeTarget(target + 1)}
              aria-label="목표 횟수 늘리기"
              className="flex size-8 items-center justify-center rounded-pill hover:bg-surface"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        )}
      </div>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-heat-0"
        role="progressbar"
        aria-valuenow={thisWeek}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label="주간 기록 목표 달성률"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-[var(--ease-soft)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-ink-3">
        {thisWeek >= target ? "이번 주 목표 달성! 🎉" : `${target - thisWeek}번 더 기록하면 목표 달성이에요`}
      </p>

      {/* 할 일 체크리스트 */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink-3">이번 주 할 일</p>
        {list.length > 0 && (
          <span className="text-xs text-ink-3">
            {done}/{list.length} 완료
          </span>
        )}
      </div>

      {editable && leftover > 0 && (
        <button
          type="button"
          onClick={() => start(() => carryOverGoals())}
          className="mt-2 flex items-center gap-2 rounded-box bg-warn-soft px-3 py-2 text-left text-xs font-semibold text-warn"
        >
          <ArrowBendDownRight className="size-4 shrink-0" />
          지난주에 못 끝낸 목표 {leftover}개를 이번 주로 가져오기
        </button>
      )}

      <ul className="mt-2 flex flex-col">
        {list.map((g) => (
          <li key={g.id} className="group flex items-center gap-2.5 py-1.5">
            <button
              type="button"
              disabled={!editable || g.id < 0}
              onClick={() =>
                start(async () => {
                  apply({ type: "toggle", id: g.id, done: !g.done });
                  await toggleGoal(g.id, !g.done);
                })
              }
              aria-pressed={g.done}
              aria-label={g.done ? `${g.title} 완료 취소` : `${g.title} 완료로 표시`}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-[7px] border-2 transition-colors",
                g.done ? "border-accent bg-accent text-on-accent" : "border-line-strong hover:border-accent",
              )}
            >
              {g.done && <Check weight="bold" className="size-3.5" />}
            </button>
            <span className={cn("flex-1 text-sm", g.done && "text-ink-3 line-through")}>{g.title}</span>
            {editable && g.id > 0 && (
              <button
                type="button"
                onClick={() =>
                  start(async () => {
                    apply({ type: "delete", id: g.id });
                    await deleteGoal(g.id);
                  })
                }
                aria-label={`${g.title} 삭제`}
                className="rounded-pill p-1 text-ink-3 opacity-100 hover:text-danger md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            )}
          </li>
        ))}
        {list.length === 0 && !editable && <li className="py-1.5 text-sm text-ink-3">아직 이번 주 목표가 없어요.</li>}
      </ul>

      {editable && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
            inputRef.current?.focus();
          }}
          className="mt-2 flex items-center gap-2"
        >
          <label htmlFor="new-goal" className="sr-only">
            새 목표
          </label>
          <input
            id="new-goal"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={120}
            placeholder={list.length === 0 ? "이번 주에 해낼 것 하나만 적어 봐요" : "목표 추가하기"}
            className="min-w-0 flex-1 rounded-box bg-surface-2 px-3 py-2.5 text-sm outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="목표 추가"
            className="btn-primary flex size-10 shrink-0 items-center justify-center rounded-pill disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </form>
      )}
    </div>
  );
}
