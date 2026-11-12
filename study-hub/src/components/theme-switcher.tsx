"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch, Palette, X } from "@phosphor-icons/react";
import { DEFAULT_LAYOUT, DEFAULT_THEME, LAYOUT_COOKIE, LAYOUTS, THEME_KEY, THEMES } from "@/lib/appearance";
import { cn } from "@/lib/utils";

function useHtmlAttr(name: "data-theme" | "data-layout", fallback: string) {
  return useSyncExternalStore(
    (cb) => {
      const obs = new MutationObserver(cb);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: [name] });
      return () => obs.disconnect();
    },
    () => document.documentElement.getAttribute(name) ?? fallback,
    () => fallback,
  );
}

export function useTheme() {
  const current = useHtmlAttr("data-theme", DEFAULT_THEME);
  function setTheme(id: string) {
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem(THEME_KEY, id);
    } catch {}
  }
  return [current, setTheme] as const;
}

/** 사용자용 테마 선택 (프로필 수정 화면) */
export function ThemePicker() {
  const [current, setTheme] = useTheme();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTheme(t.id)}
          aria-pressed={current === t.id}
          className={cn(
            "flex flex-col items-start gap-2 rounded-box p-3 text-left ring-1 transition-colors",
            current === t.id ? "bg-accent-soft ring-accent/40" : "bg-surface-2 ring-transparent hover:ring-line-strong",
          )}
        >
          <span className="flex -space-x-1.5">
            {t.swatch.map((c) => (
              <span
                key={c}
                className="size-5 rounded-full ring-2 ring-surface"
                style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)" }}
              />
            ))}
          </span>
          <span>
            <span className={cn("block text-sm font-semibold", current === t.id && "text-accent")}>{t.name}</span>
            <span className="block text-[11px] leading-snug text-ink-3">{t.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function saveLayout(id: string) {
  document.cookie = `${LAYOUT_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.setAttribute("data-layout", id);
}

/** 개발용 미리보기: 테마(색)와 레이아웃(틀)을 바로 바꿔 보기 */
export function DesignPreview() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useTheme();
  const layout = useHtmlAttr("data-layout", DEFAULT_LAYOUT);
  const [pending, start] = useTransition();
  const router = useRouter();

  function setLayout(id: string) {
    saveLayout(id);
    start(() => router.refresh());
  }

  return (
    <div className="fixed bottom-24 right-3 z-50 md:bottom-5 md:right-5">
      {open ? (
        <div className="rise max-h-[80dvh] w-72 overflow-y-auto rounded-card border border-line bg-surface p-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-3">
              디자인 미리보기 {pending && <CircleNotch className="size-3.5 animate-spin" />}
            </span>
            <button onClick={() => setOpen(false)} aria-label="닫기" className="rounded-pill p-1 text-ink-3 hover:bg-surface-2">
              <X className="size-4" />
            </button>
          </div>

          <p className="px-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">틀</p>
          <ul className="mt-1 flex flex-col gap-0.5">
            {LAYOUTS.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => setLayout(l.id)}
                  aria-pressed={layout === l.id}
                  className={cn(
                    "w-full rounded-box px-2.5 py-2 text-left transition-colors",
                    layout === l.id ? "bg-accent-soft" : "hover:bg-surface-2",
                  )}
                >
                  <span className={cn("block text-sm font-semibold", layout === l.id && "text-accent")}>{l.name}</span>
                  <span className="block text-[11px] text-ink-3">{l.desc}</span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">색</p>
          <div className="mt-1 flex flex-wrap gap-1.5 px-2 pb-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                aria-pressed={theme === t.id}
                title={t.name}
                className={cn(
                  "flex items-center gap-1.5 rounded-pill px-2.5 py-1.5 text-xs font-semibold ring-1",
                  theme === t.id ? "bg-accent-soft text-accent ring-accent/40" : "ring-line hover:bg-surface-2",
                )}
              >
                <span className="size-3 rounded-full" style={{ background: t.swatch[1] }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-pill border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]"
        >
          <Palette className="size-4 text-accent" />
          {LAYOUTS.find((l) => l.id === layout)?.name ?? "디자인"}
        </button>
      )}
    </div>
  );
}
