import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">로그인에 실패했어요</h1>
      <p className="text-ink-2">링크가 만료됐거나 중간에 취소된 것 같아요.</p>
      <Link href="/login" className="rounded-pill btn-primary px-5 py-2.5 text-sm font-semibold">
        다시 로그인하기
      </Link>
    </div>
  );
}
