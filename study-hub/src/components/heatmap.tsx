import { dayKey } from "@/lib/utils";

const WEEKS = 12;

/** 깃허브 잔디처럼 최근 12주 기록을 보여줌 */
export function Heatmap({ counts }: { counts: Record<string, number> }) {
  const today = new Date();
  // 이번 주 일요일까지 채우도록 끝점을 맞춤
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const cells: { key: string; count: number; future: boolean }[] = [];
  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const key = dayKey(d);
    cells.push({ key, count: counts[key] ?? 0, future: d > today });
  }

  const tone = (n: number) =>
    n === 0 ? "bg-heat-0" : n === 1 ? "bg-heat-1" : n === 2 ? "bg-heat-2" : "bg-heat-3";

  return (
    <div className="max-w-[320px]">
      <div className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
        {cells.map((c) => (
          <div
            key={c.key}
            title={`${c.key} · ${c.count}개`}
            className={`aspect-square rounded-[4px] ${c.future ? "bg-transparent" : tone(c.count)}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-ink-3">
        적음
        {[0, 1, 2, 3].map((n) => (
          <span key={n} className={`size-2.5 rounded-[3px] ${tone(n)}`} />
        ))}
        많음
      </div>
    </div>
  );
}
