"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CircleNotch } from "@phosphor-icons/react";
import { acceptAnswer, addComment, deleteComment, deletePost } from "@/app/actions";

export function PostActions({ postId }: { postId: number }) {
  const [pending, start] = useTransition();
  return (
    <span className="ml-auto flex items-center gap-1 text-[13px]">
      <Link href={`/posts/${postId}/edit`} className="rounded-pill px-3 py-1.5 text-ink-2 hover:bg-surface-2">
        수정
      </Link>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm("이 글을 삭제할까요? 되돌릴 수 없어요.")) start(() => deletePost(postId));
        }}
        className="rounded-pill px-3 py-1.5 text-danger hover:bg-danger-soft"
      >
        삭제
      </button>
    </span>
  );
}

export function CommentActions({
  commentId,
  postId,
  canDelete,
  canAccept,
}: {
  commentId: number;
  postId: number;
  canDelete: boolean;
  canAccept: boolean;
}) {
  const [pending, start] = useTransition();
  if (!canDelete && !canAccept) return null;
  return (
    <span className="ml-auto flex items-center gap-1 text-[13px]">
      {canAccept && (
        <button
          disabled={pending}
          onClick={() => start(() => acceptAnswer(commentId, postId))}
          className="rounded-pill bg-accent-soft px-3 py-1 font-semibold text-accent hover:brightness-95"
        >
          채택하기
        </button>
      )}
      {canDelete && (
        <button
          disabled={pending}
          onClick={() => {
            if (confirm("댓글을 삭제할까요?")) start(() => deleteComment(commentId, postId));
          }}
          className="rounded-pill px-3 py-1 text-ink-3 hover:text-danger"
        >
          삭제
        </button>
      )}
    </span>
  );
}

export function CommentForm({ postId, placeholder }: { postId: number; placeholder: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit() {
    if (!body.trim() || pending) return;
    setError(null);
    start(async () => {
      const res = await addComment(postId, body);
      if (res?.error) setError(res.error);
      else setBody("");
    });
  }

  return (
    <div className="rounded-card bg-surface p-2 ring-1 ring-line focus-within:ring-accent/30">
      <textarea
        ref={ref}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-relaxed outline-none placeholder:text-ink-3"
      />
      <div className="flex items-center justify-between px-2 pb-1">
        <span className="text-xs text-ink-3">마크다운·코드블록 사용 가능 · Ctrl+Enter로 등록</span>
        <button
          onClick={submit}
          disabled={pending || !body.trim()}
          className="flex items-center gap-1.5 rounded-pill btn-primary px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40"
        >
          {pending && <CircleNotch className="size-4 animate-spin" />}
          등록
        </button>
      </div>
      {error && <p className="px-3 pb-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
