import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createDemoClient, isDemo } from "@/lib/demo";

export async function createClient() {
  // 데모 모드: Supabase 없이 메모리 속 샘플 데이터로 동작 (개발 전용)
  if (isDemo()) {
    await connection(); // 실제 모드처럼 요청마다 렌더링되게 함
    return createDemoClient() as unknown as Awaited<ReturnType<typeof createRealClient>>;
  }
  return createRealClient();
}

async function createRealClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서는 쿠키를 쓸 수 없음. proxy.ts가 세션을 갱신하므로 무시해도 됨.
          }
        },
      },
    },
  );
}

/** 로그인한 사용자 id (서명 검증된 JWT 기준). 비로그인이면 null */
export async function getUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
}
