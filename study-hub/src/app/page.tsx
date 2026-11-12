import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, PencilSimpleLine, Question, Target } from "@phosphor-icons/react/dist/ssr";
import { Feed } from "@/components/feed";
import { GoalsBoard } from "@/components/goals-board";
import { Heatmap } from "@/components/heatmap";
import { PostList } from "@/components/post-card";
import { QuickComposer } from "@/components/quick-composer";
import { PageSkeleton } from "@/components/skeleton";
import { OpenQuestionsCard, ProgressCard, ProgressStrip, TilLink, WeeklyCard } from "@/components/widgets";
import { getGoals, getMyProgress, getPosts } from "@/lib/data";
import { getLayout } from "@/lib/layout";

async function Home({ searchParams }: PageProps<"/">) {
  const [{ lang }, layout] = await Promise.all([searchParams, getLayout()]);
  const l = typeof lang === "string" ? lang : undefined;

  switch (layout) {
    case "sidebar":
      return <SidebarHome lang={l} />;
    case "timeline":
      return <TimelineHome lang={l} />;
    case "dashboard":
      return <DashboardHome />;
    case "gallery":
      return <GalleryHome lang={l} />;
    default:
      return <FloatHome lang={l} />;
  }
}

/* ---------- 1. 플로팅: 카드 피드 + 오른쪽 진도 ---------- */
function FloatHome({ lang }: { lang?: string }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 pb-32 pt-8 md:pt-12 lg:grid-cols-[1fr_300px]">
      <section>
        <h1 className="text-2xl font-bold tracking-[-0.03em]">오늘의 기록</h1>
        <p className="mt-1 text-[15px] text-ink-2">스터디원들이 남긴 공부 기록이에요.</p>
        <div className="mt-6">
          <Feed basePath="/" lang={lang} />
        </div>
      </section>
      <aside className="order-first lg:order-none">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          <ProgressCard />
          <WeeklyCard className="hidden lg:block" />
        </div>
      </aside>
    </div>
  );
}

/* ---------- 2. 사이드바: 문서처럼 넓고 촘촘한 목록 ---------- */
function SidebarHome({ lang }: { lang?: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 pt-8 md:px-10 md:pt-12">
      <p className="text-sm text-ink-3">스터디 로그 / 피드</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">모든 기록</h1>
      <div className="mt-6">
        <ProgressStrip />
      </div>
      <div className="mt-8">
        <Feed basePath="/" lang={lang} />
      </div>
    </div>
  );
}

/* ---------- 3. 타임라인: 가운데 피드 + 바로 쓰기 + 오른쪽 위젯 ---------- */
async function TimelineHome({ lang }: { lang?: string }) {
  const me = await getMyProgress();
  return (
    <div className="mx-auto flex max-w-[1080px] justify-center gap-8 pb-32 md:px-6">
      <section className="w-full max-w-[600px] md:border-x md:border-line">
        <div className="sticky top-0 z-20 border-b border-line bg-nav px-4 py-4 backdrop-blur-xl sm:px-5">
          <h1 className="text-xl font-bold tracking-[-0.03em]">홈</h1>
        </div>
        <div className="border-b border-line">
          <QuickComposer name={me.name} avatar={me.avatar} />
        </div>
        <div className="px-4 pt-4 sm:px-5">
          <Feed basePath="/" lang={lang} />
        </div>
      </section>
      <aside className="hidden w-[320px] shrink-0 lg:block">
        <div className="sticky top-6 flex flex-col gap-4 pt-6">
          <ProgressCard bezel={false} />
          <OpenQuestionsCard />
          <WeeklyCard limit={5} />
        </div>
      </aside>
    </div>
  );
}

/* ---------- 4. 대시보드: 한눈에 보는 바둑판(벤토) ---------- */
async function DashboardHome() {
  const me = await getMyProgress();
  const [recent, { goals, leftover }] = await Promise.all([getPosts({ limit: 4 }), getGoals(me.userId)]);
  const hour = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Seoul" }));
  const greet = hour < 12 ? "좋은 아침이에요" : hour < 18 ? "좋은 오후예요" : "오늘도 수고했어요";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-8 md:px-6 md:pt-10">
      <p className="text-sm text-ink-3">{greet}</p>
      <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em]">{me.name}님의 스터디 현황</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-6">
        <div className="card p-6 md:col-span-4">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[13px] font-semibold text-ink-3">연속 기록</p>
              <p className="mt-1 text-5xl font-bold tracking-[-0.04em]">
                {me.streak}
                <span className="ml-1 text-lg font-semibold text-ink-2">일</span>
              </p>
              <Link href="/settings" className="group mt-4 block max-w-[240px]">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-3">
                  <Target className="size-4 text-accent" /> 방학 목표
                </span>
                <span className="mt-1 block text-sm text-ink-2 group-hover:text-ink">
                  {me.goal || "아직 없어요. 눌러서 정해 보세요"}
                </span>
              </Link>
            </div>
            <div className="w-full max-w-[320px]">
              <Heatmap counts={me.counts} />
            </div>
          </div>
        </div>

        <div className="card flex flex-col justify-between gap-4 !bg-accent-soft p-6 md:col-span-2">
          <div>
            <p className="text-[13px] font-semibold text-accent">오늘 할 일</p>
            <p className="mt-2 text-xl font-bold leading-snug">
              {me.wroteToday ? "오늘 기록 완료! 다른 사람 질문에 답해 볼까요?" : "아직 오늘 기록이 없어요"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {!me.wroteToday && <TilLink className="!bg-surface" />}
            <Link
              href="/write?template=question"
              className="flex items-center gap-2 rounded-pill bg-surface/60 px-4 py-2.5 text-sm font-semibold"
            >
              <Question className="size-4" /> 막힌 거 질문하기
            </Link>
          </div>
        </div>

        <div className="card p-6 md:col-span-3">
          <GoalsBoard goals={goals} leftover={leftover.length} thisWeek={me.thisWeek} weeklyTarget={me.weeklyTarget} />
        </div>
        <div className="flex flex-col gap-4 md:col-span-3">
          <OpenQuestionsCard limit={3} />
          <WeeklyCard limit={6} />
        </div>

        <section className="md:col-span-6">
          <div className="mb-3 mt-4 flex items-end justify-between">
            <h2 className="text-lg font-bold tracking-[-0.02em]">최근 기록</h2>
            <Link href="/questions" className="flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
              Q&A 보기 <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="[&>div]:grid [&>div]:gap-3 md:[&>div]:grid-cols-2">
            <PostList posts={recent} variant="card" />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- 5. 갤러리: 블로그처럼 큰 제목 + 카드 그리드 ---------- */
function GalleryHome({ lang }: { lang?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-10 md:px-6 md:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent">WINTER CODING STUDY</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight tracking-[-0.04em] md:text-5xl">
            이번 방학,
            <br />
            우리가 배운 것들
          </h1>
        </div>
        <Link href="/write" className="btn-primary flex items-center gap-2 rounded-pill px-5 py-3 text-sm font-bold">
          <PencilSimpleLine className="size-4" /> 나도 기록하기
        </Link>
      </div>
      <div className="mt-8">
        <ProgressStrip />
      </div>
      <div className="mt-8">
        <Feed basePath="/" lang={lang} />
      </div>
    </div>
  );
}

export default function Page(props: PageProps<"/">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Home {...props} />
    </Suspense>
  );
}
