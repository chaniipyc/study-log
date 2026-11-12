"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowsOut, CircleNotch } from "@phosphor-icons/react";
import { createPost } from "@/app/actions";
import type { Language } from "@/lib/types";
import { LANGUAGES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui";

/** 피드 맨 위에서 바로 쓰는 짧은 기록. 첫 줄이 제목이 됨 */
export function QuickComposer({ name, avatar }: { name: string; avatar: string | null }) {
  const [text, setText] = useState("");
  const [lang, setLang] = useState<Language>("c");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    const t = text.trim();
    if (!t || pending) return;
    const [first, ...rest] = t.split("\n");
    const title = first.replace(/^#+\s*/, "").slice(0, 80) || "오늘의 기록";
    const body = rest.join("\n").trim() || t;
    setError(null);
    start(async () => {
      const res = await createPost({ kind: "note", template: "til", language: lang, title, body, link_url: null });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex gap-3 px-4 py-4 sm:px-5">
      <Avatar src={avatar} name={name} size={42} />
      <div className="min-w-0 flex-1">
        <label htmlFor="quick" className="sr-only">
          빠른 기록
        </label>
        <textarea
          id="quick"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          rows={text ? 4 : 2}
          placeholder={`${name}님, 오늘 뭘 배웠나요? 첫 줄이 제목이 돼요.`}
          className="w-full resize-none bg-transparent pt-2 text-[17px] leading-relaxed outline-none placeholder:text-ink-3"
        />
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLang(l.value)}
              aria-pressed={lang === l.value}
              className={cn(
                "rounded-pill px-2.5 py-1 text-xs font-semibold transition-colors",
                lang === l.value ? "bg-accent text-on-accent" : "text-ink-2 hover:bg-surface-2",
              )}
            >
              {l.label}
            </button>
          ))}
          <Link
            href="/write"
            className="ml-auto flex items-center gap-1 rounded-pill px-2.5 py-1.5 text-xs text-ink-3 hover:bg-surface-2 hover:text-ink"
          >
            <ArrowsOut className="size-3.5" /> 크게 쓰기
          </Link>
          <button
            onClick={submit}
            disabled={!text.trim() || pending}
            className="btn-primary flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-bold disabled:opacity-40"
          >
            {pending && <CircleNotch className="size-4 animate-spin" />}
            올리기
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
