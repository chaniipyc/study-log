import { Suspense } from "react";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { PageSkeleton } from "@/components/skeleton";
import { DesignPreview } from "@/components/theme-switcher";
import { appearanceInitScript } from "@/lib/appearance";
import { getMyProgress } from "@/lib/data";
import { getLayout } from "@/lib/layout";
import { getUserId } from "@/lib/supabase/server";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "스터디 로그",
  description: "함께 기록하고, 묻고, 답하는 방학 코딩 스터디",
};

async function NavLoader() {
  const userId = await getUserId();
  if (!userId) return null;
  const [layout, me] = await Promise.all([getLayout(), getMyProgress()]);
  return (
    <Nav
      layout={layout}
      me={{ id: me.userId, display_name: me.name, avatar_url: me.avatar, streak: me.streak }}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${jetbrains.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceInitScript }} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 종이 테마의 명조 제목용 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;600;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <NavLoader />
        </Suspense>
        <main className="flex-1 w-full">
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
        </main>
        {/* 디자인 비교용: 개발 서버에서만 보임 */}
        {process.env.NODE_ENV !== "production" && <DesignPreview />}
      </body>
    </html>
  );
}
