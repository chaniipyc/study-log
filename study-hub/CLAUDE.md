@AGENTS.md

# 스터디 로그 앱

- 스택: Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, Supabase.
- Next.js 16 API는 학습 데이터와 다를 수 있어요. 코드를 쓰기 전에 `node_modules/next/dist/docs/`를 확인해요.
  - 예: `middleware.ts`는 `proxy.ts`로 바뀌었어요.
- 데이터 접근은 `src/lib/data.ts`, 쓰기는 `src/app/actions.ts`로 모아요.
- 색은 `src/app/themes.css`의 토큰만 써요. 컴포넌트에 hex 색을 직접 쓰지 않아요.
- DB 변경은 `supabase/schema.sql`에 반영해요.
  - 새 테이블에는 RLS, 정책, `GRANT`가 꼭 있어야 해요.
  - 데모 모드(`src/lib/demo.ts`)도 함께 갱신해요.
- 확인 방법: `npx tsc --noEmit`, `npm run lint`, `npm run build`. 화면은 `DEMO_MODE=1`로 개발 서버를 띄워서 봐요.
- 작업을 마치면 `../CLAUDE.md`의 **포트폴리오 기록 규칙**에 따라 `docs/`를 갱신해요.
