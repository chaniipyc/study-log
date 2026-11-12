import Image from "next/image";
import type { Language } from "@/lib/types";
import { LANGUAGE_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

const LANG_STYLE: Record<Language, string> = {
  c: "bg-lang-c text-lang-c-ink",
  java: "bg-lang-java text-lang-java-ink",
  sql: "bg-lang-sql text-lang-sql-ink",
  python: "bg-lang-python text-lang-python-ink",
  web: "bg-lang-web text-lang-web-ink",
  etc: "bg-lang-etc text-lang-etc-ink",
};

export function LangBadge({ lang, className }: { lang: Language; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-[12px] font-semibold",
        LANG_STYLE[lang],
        className,
      )}
    >
      {LANGUAGE_LABEL[lang]}
    </span>
  );
}

export function Avatar({
  src,
  name,
  size = 32,
}: {
  src: string | null | undefined;
  name: string | null | undefined;
  size?: number;
}) {
  const initial = (name ?? "?").trim().charAt(0) || "?";
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full bg-surface-2 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-pill bg-accent-soft px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-accent">
      {children}
    </span>
  );
}

export function EmptyState({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      {desc && <p className="text-sm text-ink-2">{desc}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
