-- =========================================================
-- 스터디 허브 DB 스키마
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 Run 하면 됩니다.
-- =========================================================

-- ---------- 프로필 ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url  text,
  bio         text not null default '',
  languages   text[] not null default '{}',   -- 공부 중인 언어: c, java, sql, python, web, etc
  goal        text not null default '',        -- 방학 목표 한 줄
  created_at  timestamptz not null default now()
);

-- ---------- 기록(글) ----------
-- kind: note(사이트에서 직접 쓴 글) | link(외부 블로그 링크) | question(질문)
create table public.posts (
  id          bigint generated always as identity primary key,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  kind        text not null default 'note' check (kind in ('note', 'link', 'question')),
  template    text,                              -- til, concept, problem, retro, question
  language    text not null default 'etc' check (language in ('c', 'java', 'sql', 'python', 'web', 'etc')),
  title       text not null check (char_length(title) between 1 and 200),
  body        text not null default '',
  link_url    text check (link_url is null or link_url ~* '^https?://'),
  is_solved   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_author_id_idx  on public.posts (author_id, created_at desc);

-- ---------- 댓글 / 답변 ----------
create table public.comments (
  id          bigint generated always as identity primary key,
  post_id     bigint not null references public.posts (id) on delete cascade,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 10000),
  is_accepted boolean not null default false,   -- 질문 글에서 채택된 답변
  created_at  timestamptz not null default now()
);

create index comments_post_id_idx   on public.comments (post_id, created_at);
create index comments_author_id_idx on public.comments (author_id);

-- ---------- 반응 (👍 💡 🔥) ----------
create table public.reactions (
  post_id    bigint not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  emoji      text not null check (emoji in ('like', 'idea', 'fire')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, emoji)
);

create index reactions_user_id_idx on public.reactions (user_id);

-- =========================================================
-- 가입 시 프로필 자동 생성 (GitHub/Google 이름·사진 사용)
-- 노출되지 않는 private 스키마에 두어 API로 호출할 수 없게 함
-- =========================================================
create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'user_name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- updated_at 자동 갱신
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function private.touch_updated_at();

-- =========================================================
-- Data API 접근 권한 (2026-10부터 새 테이블은 직접 GRANT 필요)
-- 로그인한 멤버만 사용. 비로그인(anon)에는 아무것도 열지 않음.
-- =========================================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles  to authenticated;
grant select, insert, update, delete on public.posts     to authenticated;
grant select, insert, delete on public.comments to authenticated;
grant update (body) on public.comments to authenticated;  -- 채택 여부는 직접 못 바꾸게 본문만
grant select, insert, delete         on public.reactions to authenticated;

-- =========================================================
-- RLS: 멤버는 모두 읽기 가능, 쓰기/수정/삭제는 본인 것만
-- =========================================================
alter table public.profiles  enable row level security;
alter table public.posts     enable row level security;
alter table public.comments  enable row level security;
alter table public.reactions enable row level security;

-- profiles
create policy "멤버는 프로필을 볼 수 있음" on public.profiles
  for select to authenticated using (true);
create policy "본인 프로필만 수정" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- posts
create policy "멤버는 글을 볼 수 있음" on public.posts
  for select to authenticated using (true);
create policy "본인 이름으로만 글 작성" on public.posts
  for insert to authenticated
  with check ((select auth.uid()) = author_id);
create policy "본인 글만 수정" on public.posts
  for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);
create policy "본인 글만 삭제" on public.posts
  for delete to authenticated
  using ((select auth.uid()) = author_id);

-- comments
create policy "멤버는 댓글을 볼 수 있음" on public.comments
  for select to authenticated using (true);
create policy "본인 이름으로만 댓글 작성" on public.comments
  for insert to authenticated
  with check ((select auth.uid()) = author_id and is_accepted = false);
create policy "본인 댓글만 수정" on public.comments
  for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);
create policy "본인 댓글만 삭제" on public.comments
  for delete to authenticated
  using ((select auth.uid()) = author_id);

-- reactions
create policy "멤버는 반응을 볼 수 있음" on public.reactions
  for select to authenticated using (true);
create policy "본인 반응만 추가" on public.reactions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "본인 반응만 취소" on public.reactions
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- =========================================================
-- 답변 채택: 질문 작성자만, 자기 질문의 댓글 하나를 채택
-- (댓글은 남의 것이라 일반 update 정책으로는 못 바꾸므로 함수로 처리)
-- =========================================================
create or replace function public.accept_answer(target_comment_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_post_id bigint;
begin
  select c.post_id into v_post_id
  from public.comments c
  join public.posts p on p.id = c.post_id
  where c.id = target_comment_id
    and p.kind = 'question'
    and p.author_id = (select auth.uid());

  if v_post_id is null then
    raise exception '본인 질문의 답변만 채택할 수 있어요';
  end if;

  update public.comments set is_accepted = (id = target_comment_id) where post_id = v_post_id;
  update public.posts set is_solved = true where id = v_post_id;
end;
$$;

revoke all on function public.accept_answer(bigint) from public, anon;
grant execute on function public.accept_answer(bigint) to authenticated;

-- =========================================================
-- 목표 설정
--  - weekly_target: 주에 몇 번 기록할지 (주간 기록 목표)
--  - goals: 이번 주 할 일 체크리스트. 멤버끼리 서로 볼 수 있어 꾸준함에 도움
-- =========================================================
alter table public.profiles
  add column weekly_target smallint not null default 5
  check (weekly_target between 1 and 14);

create table public.goals (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  done        boolean not null default false,
  week_start  date not null,                     -- 그 주의 월요일 (한국 시간)
  created_at  timestamptz not null default now()
);

-- "내 이번 주 목표" 조회용 + user_id 외래키 인덱스 역할
create index goals_user_week_idx on public.goals (user_id, week_start);

grant select, insert, update, delete on public.goals to authenticated;
alter table public.goals enable row level security;

create policy "멤버는 목표를 볼 수 있음" on public.goals
  for select to authenticated using (true);
create policy "본인 목표만 추가" on public.goals
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "본인 목표만 수정" on public.goals
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "본인 목표만 삭제" on public.goals
  for delete to authenticated
  using ((select auth.uid()) = user_id);
