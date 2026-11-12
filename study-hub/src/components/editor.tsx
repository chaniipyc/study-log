"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CircleNotch } from "@phosphor-icons/react";
import { createPost, updatePost, type PostInput } from "@/app/actions";
import { TEMPLATES } from "@/lib/templates";
import type { Language, PostKind } from "@/lib/types";
import { LANGUAGES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";

const KINDS: { value: PostKind; label: string; desc: string }[] = [
  { value: "note", label: "여기에 쓰기", desc: "마크다운으로 바로 작성" },
  { value: "link", label: "블로그 링크", desc: "velog·티스토리·노션 글 공유" },
  { value: "question", label: "질문하기", desc: "막힌 부분 물어보기" },
];

const DRAFT_KEY = "study-log:draft";

type Props = {
  postId?: number;
  initial?: PostInput;
  initialTemplate?: string;
};

export function Editor({ postId, initial, initialTemplate }: Props) {
  const isEdit = postId !== undefined;
  const startTpl = !initial ? TEMPLATES.find((t) => t.id === initialTemplate) : undefined;

  const [form, setForm] = useState<PostInput>(
    initial ?? {
      kind: startTpl?.kind ?? "note",
      template: startTpl?.id ?? null,
      language: "c",
      title: startTpl?.title ?? "",
      body: startTpl?.body ?? "",
      link_url: null,
    },
  );
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [draftDismissed, setDraftDismissed] = useState(false);
  const draftExists = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        return Boolean(raw && (JSON.parse(raw) as PostInput).body?.trim());
      } catch {
        return false;
      }
    },
    () => false,
  );
  const hasDraft = !isEdit && !draftDismissed && savedAt === null && draftExists;
  const [pending, startTransition] = useTransition();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // 자동 임시저장 (입력 멈추고 0.8초 뒤)
  useEffect(() => {
    if (isEdit) return;
    const t = setTimeout(() => {
      try {
        if (form.title.trim() || form.body.trim() || form.link_url) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
          setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
        }
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [form, isEdit]);

  function set<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applyTemplate(id: string) {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    if (form.body.trim() && !confirm("지금 쓴 내용을 템플릿으로 바꿀까요?")) return;
    setForm((f) => ({ ...f, template: tpl.id, kind: tpl.kind, title: f.title.trim() ? f.title : tpl.title, body: tpl.body }));
    setTab("write");
    requestAnimationFrame(() => bodyRef.current?.focus());
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setForm(JSON.parse(raw));
    } catch {}
    setDraftDismissed(true);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      if (!isEdit) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
      }
      const res = isEdit ? await updatePost(postId, form) : await createPost(form);
      if (res?.error) {
        setError(res.error);
        if (!isEdit) {
          try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
          } catch {}
        }
      }
    });
  }

  // Ctrl/Cmd + Enter 로 바로 올리기
  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  // 탭 키로 들여쓰기 (코드 쓸 때 편하게)
  function onBodyKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: s, selectionEnd: end } = el;
      const next = form.body.slice(0, s) + "    " + form.body.slice(end);
      set("body", next);
      requestAnimationFrame(() => el.setSelectionRange(s + 4, s + 4));
    }
  }

  const templatesForKind = TEMPLATES.filter((t) => (form.kind === "question" ? t.kind === "question" : t.kind === "note"));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-5" onKeyDown={onKeyDown}>
      {/* 상단 바 */}
      <div className="flex items-center justify-between">
        <Link href={isEdit ? `/posts/${postId}` : "/"} className="flex items-center gap-1.5 rounded-pill px-2 py-2 text-sm text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" /> 나가기
        </Link>
        <div className="flex items-center gap-3">
          {savedAt && <span className="hidden text-xs text-ink-3 sm:inline">{savedAt} 임시저장됨</span>}
          <button
            onClick={submit}
            disabled={pending}
            className="flex items-center gap-2 rounded-pill btn-primary px-5 py-2.5 text-sm font-semibold transition-transform duration-300 ease-[var(--ease-soft)] active:scale-[0.97] disabled:opacity-60"
          >
            {pending && <CircleNotch className="size-4 animate-spin" />}
            {isEdit ? "수정 완료" : "올리기"}
            <kbd className="hidden rounded-md bg-on-primary/15 px-1.5 py-0.5 font-sans text-[11px] sm:inline">Ctrl ↵</kbd>
          </button>
        </div>
      </div>

      {hasDraft && (
        <div className="rise mt-4 flex items-center justify-between gap-3 rounded-box bg-accent-soft px-4 py-3 text-sm text-accent">
          <span>저장 안 된 임시글이 있어요.</span>
          <div className="flex gap-2">
            <button onClick={() => setDraftDismissed(true)} className="rounded-pill px-3 py-1 hover:bg-surface/60">
              무시
            </button>
            <button onClick={restoreDraft} className="rounded-pill bg-surface px-3 py-1 font-semibold">
              이어 쓰기
            </button>
          </div>
        </div>
      )}

      {/* 글 종류 */}
      {!isEdit && (
        <div className="mt-6 grid grid-cols-3 gap-2">
          {KINDS.map((k) => (
            <button
              key={k.value}
              onClick={() => {
                set("kind", k.value);
                if (k.value === "question" && !form.body.trim()) applyTemplate("question");
              }}
              className={cn(
                "rounded-box px-3 py-3 text-left transition-all duration-300 ease-[var(--ease-soft)]",
                form.kind === k.value ? "bg-primary text-on-primary" : "bg-surface ring-1 ring-line hover:ring-line-strong",
              )}
            >
              <div className="text-sm font-semibold">{k.label}</div>
              <div className={cn("mt-0.5 hidden text-xs sm:block", form.kind === k.value ? "text-on-primary/70" : "text-ink-3")}>
                {k.desc}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 언어 */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-ink-3">언어</span>
        {LANGUAGES.map((l) => (
          <button
            key={l.value}
            onClick={() => set("language", l.value as Language)}
            className={cn(
              "rounded-pill px-3 py-1.5 text-[13px] font-semibold transition-colors",
              form.language === l.value ? "bg-accent text-on-accent" : "bg-surface text-ink-2 ring-1 ring-line",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* 템플릿 */}
      {form.kind !== "link" && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-ink-3">템플릿</span>
          {templatesForKind.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id)}
              title={t.hint}
              className={cn(
                "rounded-pill px-3 py-1.5 text-[13px] transition-colors",
                form.template === t.id ? "bg-surface-2 font-semibold text-ink" : "text-ink-2 hover:bg-surface-2",
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* 본문 카드 */}
      <div className="mt-6 bezel">
        <div className="bezel-inner p-5 sm:p-7">
          {form.kind === "link" && (
            <input
              value={form.link_url ?? ""}
              onChange={(e) => set("link_url", e.target.value)}
              placeholder="블로그 글 주소를 붙여넣으세요 (https://velog.io/...)"
              className="mb-4 w-full rounded-box bg-surface-2 px-4 py-3 text-[15px] outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-accent/30"
              autoFocus
            />
          )}
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={form.kind === "question" ? "무엇이 궁금한가요?" : "제목"}
            className="w-full bg-transparent text-2xl font-bold tracking-[-0.03em] outline-none placeholder:text-ink-3/60"
            autoFocus={form.kind !== "link"}
          />

          <div className="mt-4 flex gap-1 border-b border-line">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "-mb-px border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors",
                  tab === t ? "border-ink text-ink" : "border-transparent text-ink-3",
                )}
              >
                {t === "write" ? "쓰기" : "미리보기"}
              </button>
            ))}
          </div>

          {tab === "write" ? (
            <textarea
              ref={bodyRef}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              onKeyDown={onBodyKeyDown}
              placeholder={
                form.kind === "link"
                  ? "한 줄 소개나 핵심 요약을 남겨 주세요 (선택)"
                  : "마크다운으로 자유롭게 써요. 코드는 ``` 로 감싸면 색이 입혀져요."
              }
              className="mt-4 min-h-[45vh] w-full resize-y bg-transparent font-mono text-[14px] leading-7 outline-none placeholder:font-sans placeholder:text-ink-3"
            />
          ) : (
            <div className="mt-5 min-h-[45vh]">
              {form.body.trim() ? <Markdown>{form.body}</Markdown> : <p className="text-ink-3">아직 내용이 없어요.</p>}
            </div>
          )}
        </div>
      </div>

      {error && <p className="rise mt-4 text-center text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
