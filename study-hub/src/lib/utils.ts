export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });

export function timeAgo(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "방금 전";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(diff / 86400), "day");
  return new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

/** 한국 시간 기준 YYYY-MM-DD */
export function dayKey(date: Date | string) {
  return new Date(date).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 그 주 월요일 (한국 시간 기준, YYYY-MM-DD) */
export function weekStart(date: Date = new Date(), offsetWeeks = 0) {
  const kst = new Date(dayKey(date) + "T00:00:00Z");
  const dow = (kst.getUTCDay() + 6) % 7; // 월=0 … 일=6
  kst.setUTCDate(kst.getUTCDate() - dow + offsetWeeks * 7);
  return kst.toISOString().slice(0, 10);
}

/** 오늘(포함)부터 거꾸로 이어진 연속 기록 일수. 오늘 기록이 없으면 어제부터 셈 */
export function streakOf(days: Set<string>) {
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
