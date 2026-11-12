"use client";

import { useState } from "react";
import { GithubLogo, GoogleLogo, CircleNotch } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Provider = "github" | "google";

export function LoginButtons() {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: Provider) {
    setLoading(provider);
    setError(null);
    const supabase = createClient();
    const raw = new URLSearchParams(window.location.search).get("next") ?? "/";
    const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError("로그인을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setLoading(null);
    }
  }

  const base =
    "flex w-full items-center justify-center gap-2.5 rounded-pill px-5 py-3.5 text-[15px] font-semibold transition-all duration-300 ease-[var(--ease-soft)] active:scale-[0.98] disabled:opacity-60";

  return (
    <div className="flex flex-col gap-2.5">
      <button
        onClick={() => signIn("github")}
        disabled={loading !== null}
        className={`${base} btn-primary hover:opacity-90`}
      >
        {loading === "github" ? (
          <CircleNotch className="size-5 animate-spin" />
        ) : (
          <GithubLogo weight="fill" className="size-5" />
        )}
        GitHub로 시작하기
      </button>
      <button
        onClick={() => signIn("google")}
        disabled={loading !== null}
        className={`${base} bg-surface-2 text-ink hover:bg-surface-hover`}
      >
        {loading === "google" ? (
          <CircleNotch className="size-5 animate-spin" />
        ) : (
          <GoogleLogo weight="bold" className="size-5" />
        )}
        Google로 시작하기
      </button>
      {error && <p className="mt-1 text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
