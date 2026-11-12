import { LoginButtons } from "./login-buttons";

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rise">
        <span className="inline-flex rounded-pill bg-accent-soft px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-accent">
          WINTER CODING STUDY
        </span>
        <h1 className="mt-5 text-[2rem] font-bold leading-[1.25] tracking-[-0.03em]">
          매일 조금씩,
          <br />
          같이 기록해요.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
          C, Java, SQL… 각자 공부한 걸 남기고
          <br />
          모르는 건 편하게 물어보는 공간이에요.
        </p>

        <div className="mt-10 bezel">
          <div className="bezel-inner p-5">
            <LoginButtons />
            <p className="mt-4 text-center text-xs text-ink-3">
              처음이면 자동으로 가입돼요. 비밀번호는 필요 없어요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
