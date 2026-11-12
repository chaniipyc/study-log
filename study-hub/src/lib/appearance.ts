/** 테마(색)와 레이아웃(틀) 정의. 서버·클라이언트 공용 */

export const THEMES = [
  { id: "sage", name: "세이지", desc: "오프화이트 + 초록 (기본)", swatch: ["#f6f5f1", "#2f6f4f", "#1d1d1b"] },
  { id: "notion", name: "노트", desc: "흰 캔버스 + 보라", swatch: ["#ffffff", "#5645d4", "#f6f5f4"] },
  { id: "paper", name: "종이", desc: "크림 + 테라코타 + 명조 제목", swatch: ["#faf9f5", "#cc785c", "#141413"] },
  { id: "midnight", name: "미드나잇", desc: "다크 + 라벤더", swatch: ["#08090a", "#5e6ad2", "#f7f8f8"] },
  { id: "blue", name: "클린 블루", desc: "회색 바탕 + 파랑", swatch: ["#f2f4f6", "#3182f6", "#191f28"] },
  { id: "play", name: "말랑", desc: "굵은 테두리 + 입체 버튼", swatch: ["#ffffff", "#58cc02", "#3c3c3c"] },
] as const;

export const LAYOUTS = [
  { id: "float", name: "플로팅", desc: "떠 있는 상단 메뉴 · 카드 피드 · 오른쪽 진도" },
  { id: "sidebar", name: "노트형 사이드바", desc: "왼쪽 고정 메뉴 · 촘촘한 목록" },
  { id: "timeline", name: "타임라인", desc: "SNS처럼 바로 쓰는 입력창 · 3단" },
  { id: "dashboard", name: "대시보드 (기본)", desc: "홈에서 진도·목표·할 일을 한눈에" },
  { id: "gallery", name: "갤러리", desc: "블로그처럼 카드 그리드" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type LayoutId = (typeof LAYOUTS)[number]["id"];

export const DEFAULT_THEME: ThemeId = "sage";
export const DEFAULT_LAYOUT: LayoutId = "dashboard";

export const THEME_KEY = "study-log:theme";
export const LAYOUT_COOKIE = "sl_layout";

export function toLayout(v: string | undefined | null): LayoutId {
  return LAYOUTS.some((l) => l.id === v) ? (v as LayoutId) : DEFAULT_LAYOUT;
}

/** 첫 화면이 깜빡이지 않도록 <head>에서 바로 테마·레이아웃을 적용하는 스크립트 */
export const appearanceInitScript = `try{var d=document.documentElement;var t=localStorage.getItem("${THEME_KEY}");if(t)d.dataset.theme=t;var m=document.cookie.match(/(?:^|; )${LAYOUT_COOKIE}=([^;]+)/);d.dataset.layout=m?m[1]:"${DEFAULT_LAYOUT}"}catch(e){}`;
