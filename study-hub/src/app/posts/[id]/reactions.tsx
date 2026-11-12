"use client";

import { useOptimistic, useTransition } from "react";
import { Fire, Lightbulb, ThumbsUp } from "@phosphor-icons/react";
import { toggleReaction } from "@/app/actions";
import type { Emoji } from "@/lib/types";
import { EMOJIS } from "@/lib/types";
import { cn } from "@/lib/utils";

type R = { emoji: Emoji; user_id: string };

const ICON = { like: ThumbsUp, idea: Lightbulb, fire: Fire };

export function Reactions({ postId, userId, reactions }: { postId: number; userId: string; reactions: R[] }) {
  const [, startTransition] = useTransition();
  const [optimistic, apply] = useOptimistic(reactions, (state: R[], action: { emoji: Emoji; on: boolean }) =>
    action.on
      ? [...state, { emoji: action.emoji, user_id: userId }]
      : state.filter((r) => !(r.emoji === action.emoji && r.user_id === userId)),
  );

  return (
    <div className="flex flex-wrap gap-2">
      {EMOJIS.map((e) => {
        const n = optimistic.filter((r) => r.emoji === e.value).length;
        const mine = optimistic.some((r) => r.emoji === e.value && r.user_id === userId);
        const Icon = ICON[e.value];
        return (
          <button
            key={e.value}
            onClick={() =>
              startTransition(async () => {
                apply({ emoji: e.value, on: !mine });
                await toggleReaction(postId, e.value, !mine);
              })
            }
            aria-pressed={mine}
            className={cn(
              "flex min-h-11 items-center gap-1.5 rounded-pill px-4 py-2 text-sm transition-all duration-300 ease-[var(--ease-soft)] active:scale-95",
              mine ? "bg-accent-soft font-semibold text-accent ring-1 ring-accent/20" : "bg-surface-2 text-ink-2 hover:bg-surface-hover",
            )}
          >
            <Icon weight={mine ? "fill" : "regular"} className="size-[18px]" />
            {e.label}
            {n > 0 && <span className="tabular-nums">{n}</span>}
          </button>
        );
      })}
    </div>
  );
}
