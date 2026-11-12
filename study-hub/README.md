# 스터디 로그

방학 코딩 스터디용 사이트예요. 각자 공부한 걸 기록하고, 묻고, 답해요.

- **기록하기**: 마크다운 + 코드 하이라이팅, 템플릿(TIL·개념 정리·문제풀이·주간 회고·질문), 자동 임시저장, `Ctrl+Enter`로 올리기
- **블로그 링크**: velog·티스토리·노션 글 주소만 붙여넣으면 피드에 공유돼요
- **Q&A**: 질문 → 답변 → 채택, 답변 대기/해결됨 필터
- **진도**: 깃허브 잔디 같은 12주 기록 히트맵, 연속 기록일, 최근 7일 멤버별 기록 수
- **반응·댓글**: 👍 💡 🔥, 댓글에서도 마크다운·코드블록 사용 가능

기술: Next.js 16 · Tailwind CSS 4 · Supabase (로그인·DB) · Vercel (배포)

---

## 처음 한 번만 하는 설정 (약 15분)

### 1. Supabase 프로젝트 만들기
1. https://supabase.com 에 가입하고 **New project**를 만들어요 (무료 플랜이면 충분해요. 지역은 Seoul).
2. 왼쪽 메뉴 **SQL Editor**에서 [`supabase/schema.sql`](supabase/schema.sql) 내용을 통째로 붙여넣고 **Run**을 눌러요.
3. **Project Settings → API Keys**에서 아래 두 값을 복사해요.
   - Project URL
   - Publishable key (`sb_publishable_...`)
4. 이 폴더의 `.env.local` 파일에 있는 임시 값을 복사한 값으로 바꿔요. 파일이 없으면 `.env.example`을 복사해서 만들어요.
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
   ```
   > `service_role`이나 `secret` 키는 절대 넣지 마세요. 브라우저에 그대로 노출돼요.

### 2. GitHub 로그인 연결
1. GitHub → Settings → Developer settings → **OAuth Apps → New OAuth App**
2. Homepage URL: `http://localhost:3000` (배포 후 실제 주소로 바꿔요)
3. Authorization callback URL: `https://<프로젝트ref>.supabase.co/auth/v1/callback`
4. 만들어진 Client ID와 Client Secret을 Supabase **Authentication → Sign In / Providers → GitHub**에 넣고 켜요.

### 3. Google 로그인 연결
1. Google Cloud Console → **APIs & Services → Credentials → Create credentials → OAuth client ID** (유형: Web application)
   - 처음이라면 OAuth 동의 화면부터 설정하라고 나와요. 외부(External)로 만들고 앱 이름만 적으면 돼요.
2. Authorized redirect URIs: `https://<프로젝트ref>.supabase.co/auth/v1/callback`
3. Client ID와 Secret을 Supabase **Authentication → Sign In / Providers → Google**에 넣고 켜요.

### 4. 돌아올 주소 허용하기
Supabase **Authentication → URL Configuration**
- Site URL: `http://localhost:3000` (배포 후 실제 주소로 바꿔요)
- Redirect URLs에 추가:
  - `http://localhost:3000/**`
  - (배포 후) `https://<내-사이트>.vercel.app/**`

### 5. 실행
```bash
npm install
npm run dev
```
http://localhost:3000 에 들어가서 로그인하면 끝이에요.

---

## 배포 (Vercel)
1. 이 폴더를 GitHub 저장소에 올려요.
2. https://vercel.com 에서 **Add New → Project**로 저장소를 가져와요.
3. Environment Variables에 `.env.local`과 같은 두 값을 넣고 Deploy를 눌러요.
4. 나온 주소를 Supabase Site URL·Redirect URLs, GitHub OAuth App의 Homepage URL에 반영해요.

## 참고
- 지금은 GitHub/Google 계정만 있으면 누구나 가입할 수 있어요. 멤버만 받고 싶으면 초대 코드나 허용 이메일 목록 기능을 추가하면 돼요.
- 데이터 접근 규칙(RLS): 로그인한 멤버는 모든 글을 읽을 수 있고, 글·댓글·반응의 수정과 삭제는 본인 것만 가능해요. 답변 채택은 질문 작성자만 할 수 있어요.
