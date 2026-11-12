"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PencilSimpleLine, House, ChatsCircle, UsersThree, User, GearSix } from "@phosphor-icons/react";
import type { LayoutId } from "@/lib/appearance";
import { cn } from "@/lib/utils";
import { Avatar } from "./ui";

type Me = { id: string; display_name: string; avatar_url: string | null; streak: number };

function useLinks(userId: string) {
  const pathname = usePathname();
  return {
    pathname,
    links: [
      { href: "/", label: "피드", icon: House, active: pathname === "/" },
      { href: "/questions", label: "Q&A", icon: ChatsCircle, active: pathname.startsWith("/questions") },
      { href: "/members", label: "멤버", icon: UsersThree, active: pathname === "/members" },
      { href: `/members/${userId}`, label: "내 기록", icon: User, active: pathname === `/members/${userId}` },
    ],
  };
}

export function Nav({ me, layout }: { me: Me; layout: LayoutId }) {
  const { pathname, links } = useLinks(me.id);
  // 글쓰기 화면은 집중을 위해 상단·모바일 메뉴를 숨김 (옆 메뉴형은 자리를 유지)
  const writing = pathname === "/write" || pathname.endsWith("/edit");

  return (
    <>
      {layout === "float" && !writing && <FloatNav links={links} />}
      {(layout === "dashboard" || layout === "gallery") && !writing && (
        <BarNav links={links} me={me} centered={layout === "gallery"} />
      )}
      {layout === "sidebar" && <SideNav links={links} me={me} pathname={pathname} />}
      {layout === "timeline" && <RailNav links={links} me={me} />}
      {!writing && <MobileNav links={links} />}
    </>
  );
}

type Links = ReturnType<typeof useLinks>["links"];

/* ---------- 1. 플로팅: 가운데 떠 있는 알약 ---------- */
function FloatNav({ links }: { links: Links }) {
  return (
    <header className="sticky top-4 z-30 mx-auto hidden w-max md:block">
      <nav className="flex items-center gap-1 rounded-pill bg-nav p-1.5 ring-1 ring-line backdrop-blur-xl">
        <Link href="/" className="px-4 text-[15px] font-bold tracking-[-0.03em]">
          스터디 로그
        </Link>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-pill px-4 py-2 text-sm font-medium transition-colors duration-300 ease-[var(--ease-soft)]",
              l.active ? "bg-surface-2 text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            {l.label}
          </Link>
        ))}
        <WriteButton className="ml-1" />
      </nav>
    </header>
  );
}

/* ---------- 2. 상단 바: 화면 너비 가득, 아래 경계선 ---------- */
function BarNav({ links, me, centered }: { links: Links; me: Me; centered: boolean }) {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-nav backdrop-blur-xl md:block">
      <div className={cn("mx-auto flex h-16 max-w-6xl items-center gap-6 px-6", centered && "justify-between")}>
        <Link href="/" className="text-[17px] font-bold tracking-[-0.03em]">
          스터디 로그
        </Link>
        <nav className={cn("flex h-full items-stretch gap-1", !centered && "flex-1")}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative flex items-center px-3 text-sm font-semibold transition-colors",
                l.active ? "text-ink" : "text-ink-3 hover:text-ink",
              )}
            >
              {l.label}
              {l.active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-ink" />}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <WriteButton />
          <Link href="/settings" aria-label="설정">
            <Avatar src={me.avatar_url} name={me.display_name} size={34} />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------- 3. 사이드바: 왼쪽 고정, 메뉴 + 내 정보 ---------- */
function SideNav({ links, me, pathname }: { links: Links; me: Me; pathname: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface md:flex">
      <div className="px-5 pb-4 pt-6">
        <Link href="/" className="text-[17px] font-bold tracking-[-0.03em]">
          스터디 로그
        </Link>
      </div>
      <div className="px-3">
        <Link
          href="/write"
          className="btn-primary flex w-full items-center justify-center gap-2 rounded-pill py-2.5 text-sm font-semibold"
        >
          <PencilSimpleLine className="size-4" /> 기록하기
        </Link>
      </div>
      <nav className="mt-5 flex flex-col gap-0.5 px-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 rounded-box px-3 py-2 text-sm font-medium transition-colors",
              l.active ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2/60 hover:text-ink",
            )}
          >
            <l.icon weight={l.active ? "fill" : "regular"} className="size-[18px]" />
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 px-6 text-[11px] font-semibold uppercase tracking-wider text-ink-3">바로가기</div>
      <nav className="mt-2 flex flex-col gap-0.5 px-3 text-sm">
        {[
          ["/write?template=til", "오늘의 TIL 쓰기"],
          ["/write?template=question", "질문 올리기"],
          ["/questions?status=open", "답변 기다리는 질문"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-box px-3 py-1.5 text-ink-2 hover:bg-surface-2/60 hover:text-ink">
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-box px-2 py-2">
          <Avatar src={me.avatar_url} name={me.display_name} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{me.display_name}</p>
            <p className="text-xs text-ink-3">{me.streak > 0 ? `${me.streak}일 연속 기록 중` : "오늘 첫 기록을 남겨 봐요"}</p>
          </div>
          <Link
            href="/settings"
            aria-label="설정"
            className={cn("rounded-pill p-2 text-ink-3 hover:bg-surface-2 hover:text-ink", pathname === "/settings" && "text-ink")}
          >
            <GearSix className="size-[18px]" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

/* ---------- 4. 아이콘 레일: SNS처럼 왼쪽 세로 메뉴, 넓은 화면에선 글자도 ---------- */
function RailNav({ links, me }: { links: Links; me: Me }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col items-center gap-2 py-6 md:flex xl:w-60 xl:items-stretch xl:px-4">
      <Link href="/" className="mb-4 flex size-11 items-center justify-center rounded-pill bg-accent text-base font-bold text-on-accent xl:ml-2">
        S
      </Link>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-label={l.label}
          className={cn(
            "flex size-12 items-center justify-center gap-4 rounded-pill transition-colors xl:size-auto xl:justify-start xl:px-4 xl:py-3",
            l.active ? "font-bold text-ink" : "text-ink-2 hover:bg-surface-2",
          )}
        >
          <l.icon weight={l.active ? "fill" : "regular"} className="size-[26px] shrink-0" />
          <span className="hidden text-[17px] xl:inline">{l.label}</span>
        </Link>
      ))}
      <Link
        href="/write"
        aria-label="기록하기"
        className="btn-primary mt-3 flex size-12 items-center justify-center rounded-pill font-bold xl:size-auto xl:py-3.5"
      >
        <PencilSimpleLine className="size-5 xl:hidden" />
        <span className="hidden xl:inline">기록하기</span>
      </Link>
      <Link href="/settings" className="mt-auto flex items-center gap-3 rounded-pill p-1.5 hover:bg-surface-2 xl:p-2.5">
        <Avatar src={me.avatar_url} name={me.display_name} size={36} />
        <span className="hidden min-w-0 xl:block">
          <span className="block truncate text-sm font-semibold">{me.display_name}</span>
          <span className="block text-xs text-ink-3">설정</span>
        </span>
      </Link>
    </aside>
  );
}

/* ---------- 공통: 모바일 아래 탭바 ---------- */
function MobileNav({ links }: { links: Links }) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-card bg-nav px-2 py-2 ring-1 ring-line backdrop-blur-xl md:hidden">
      {links.slice(0, 2).map((l) => (
        <MobileLink key={l.href} {...l} />
      ))}
      <Link href="/write" aria-label="기록하기" className="btn-primary flex size-12 items-center justify-center rounded-pill">
        <PencilSimpleLine className="size-5" />
      </Link>
      {links.slice(2).map((l) => (
        <MobileLink key={l.href} {...l} />
      ))}
    </nav>
  );
}

function MobileLink({ href, label, icon: Icon, active }: Links[number]) {
  return (
    <Link
      href={href}
      className={cn("flex min-h-11 w-14 flex-col items-center justify-center gap-0.5 text-[11px]", active ? "text-ink" : "text-ink-3")}
    >
      <Icon weight={active ? "fill" : "regular"} className="size-[22px]" />
      {label}
    </Link>
  );
}

function WriteButton({ className }: { className?: string }) {
  return (
    <Link
      href="/write"
      className={cn(
        "group btn-primary flex items-center gap-2 rounded-pill py-1.5 pl-4 pr-1.5 text-sm font-semibold transition-transform duration-300 ease-[var(--ease-soft)]",
        className,
      )}
    >
      기록하기
      <span className="flex size-7 items-center justify-center rounded-pill bg-on-primary/15 transition-transform duration-300 ease-[var(--ease-soft)] group-hover:rotate-[-8deg] group-hover:scale-105">
        <PencilSimpleLine className="size-4" />
      </span>
    </Link>
  );
}
