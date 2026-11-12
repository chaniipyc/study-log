import { Suspense } from "react";
import { PageSkeleton } from "@/components/skeleton";
import { updateProfile } from "@/app/actions";
import { ThemePicker } from "@/components/theme-switcher";
import { createClient, getUserId } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { LANGUAGES } from "@/lib/types";

async function SettingsPage() {
  const userId = await getUserId();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId!).single();
  const profile = data as Profile;

  const field = "w-full rounded-box bg-surface-2 px-4 py-3 text-[15px] outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-accent/30";

  return (
    <div className="mx-auto max-w-xl px-4 pb-32 pt-8 md:pt-12">
      <h1 className="text-2xl font-bold tracking-[-0.03em]">설정</h1>

      <section className="card mt-6 p-6">
        <h2 className="text-base font-bold">화면 테마</h2>
        <p className="mt-1 text-sm text-ink-2">이 기기에만 저장돼요. 바로 적용돼요.</p>
        <div className="mt-4">
          <ThemePicker />
        </div>
      </section>

      <h2 className="mt-10 text-lg font-bold tracking-[-0.02em]">프로필</h2>

      <form action={updateProfile} className="card mt-4 flex flex-col gap-5 p-6">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">이름</span>
          <input name="display_name" defaultValue={profile.display_name} required maxLength={40} className={field} />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">방학 목표</span>
          <input
            name="goal"
            defaultValue={profile.goal}
            maxLength={120}
            placeholder="예) C 포인터 완전 정복, SQL 50문제 풀기"
            className={field}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">주간 기록 목표</span>
          <select name="weekly_target" defaultValue={profile.weekly_target ?? 5} className={field}>
            {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                일주일에 {n}번 기록하기{n === 5 ? " (추천)" : ""}
              </option>
            ))}
          </select>
          <span className="text-xs text-ink-3">대시보드에서 이번 주 달성률로 보여줘요.</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">한 줄 소개</span>
          <textarea name="bio" defaultValue={profile.bio} maxLength={300} rows={3} className={`${field} resize-none`} />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">공부 중인 언어</legend>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <label key={l.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="languages"
                  value={l.value}
                  defaultChecked={profile.languages.includes(l.value)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-pill bg-surface-2 px-4 py-2 text-sm font-semibold text-ink-2 transition-colors peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
                  {l.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button className="mt-2 rounded-pill btn-primary py-3.5 text-[15px] font-semibold active:scale-[0.99]">
          저장하기
        </button>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SettingsPage />
    </Suspense>
  );
}
