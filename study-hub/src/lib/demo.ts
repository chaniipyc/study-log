/**
 * 데모 모드: Supabase 없이 화면을 확인하기 위한 메모리 속 가짜 DB.
 * DEMO_MODE=1 이고 개발 환경일 때만 켜져요. 서버를 재시작하면 데이터가 초기화돼요.
 */
import type { Comment, Emoji, Goal, Language, Post, PostKind, Profile } from "./types";
import { weekStart } from "./utils";

export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export function isDemo() {
  return process.env.DEMO_MODE === "1" && process.env.NODE_ENV !== "production";
}

type Row = Record<string, unknown>;
type DB = {
  profiles: Profile[];
  posts: Post[];
  comments: Omit<Comment, "author">[];
  reactions: { post_id: number; user_id: string; emoji: Emoji; created_at: string }[];
  goals: Goal[];
  seq: { posts: number; comments: number; goals: number };
};

const ago = (days: number, hours = 0) => new Date(Date.now() - days * 86400_000 - hours * 3600_000).toISOString();

function seed(): DB {
  const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;
  const profiles: Profile[] = [
    { id: id(1), display_name: "준호", avatar_url: null, bio: "기초부터 탄탄하게! C랑 SQL 공부 중이에요.", languages: ["c", "sql"], goal: "C 포인터 완전 정복 + SQL 50문제", weekly_target: 5, created_at: ago(40) },
    { id: id(2), display_name: "민지", avatar_url: null, bio: "자바 백엔드 개발자가 꿈이에요", languages: ["java", "sql"], goal: "자바의 정석 1권 끝내기", weekly_target: 5, created_at: ago(40) },
    { id: id(3), display_name: "도윤", avatar_url: null, bio: "", languages: ["c"], goal: "백준 브론즈 탈출", weekly_target: 4, created_at: ago(39) },
    { id: id(4), display_name: "서연", avatar_url: null, bio: "파이썬으로 데이터 분석 해보고 싶어요", languages: ["python", "sql"], goal: "판다스 기초 + SQL 조인", weekly_target: 5, created_at: ago(38) },
    { id: id(5), display_name: "지호", avatar_url: null, bio: "웹 만들어보고 싶은 사람", languages: ["web", "java"], goal: "", weekly_target: 3, created_at: ago(30) },
    { id: id(6), display_name: "하은", avatar_url: null, bio: "", languages: ["java"], goal: "객체지향 이해하기", weekly_target: 3, created_at: ago(20) },
  ];

  const P = (
    n: number,
    author: number,
    kind: PostKind,
    language: Language,
    title: string,
    body: string,
    when: string,
    extra: Partial<Post> = {},
  ): Post => ({
    id: n,
    author_id: id(author),
    kind,
    template: null,
    language,
    title,
    body,
    link_url: null,
    is_solved: false,
    created_at: when,
    updated_at: when,
    ...extra,
  });

  const posts: Post[] = [
    P(1, 1, "note", "c", "TIL · 포인터와 배열은 같은 걸까?", "## 오늘 배운 것\n- 배열 이름은 첫 번째 원소의 주소처럼 동작한다\n- 하지만 `sizeof(arr)`와 `sizeof(ptr)`는 다르다!\n\n```c\nint arr[5] = {1, 2, 3, 4, 5};\nint *p = arr;\nprintf(\"%zu %zu\\n\", sizeof(arr), sizeof(p)); // 20 8\n```\n\n## 헷갈렸던 것\n- `arr++`는 안 되는데 `p++`는 된다. 배열 이름은 상수 포인터처럼 취급된다.\n\n## 내일 할 것\n- [ ] 이중 포인터\n- [x] 포인터 연산 복습", ago(0, 2), { template: "til" }),
    P(2, 2, "question", "java", "String을 == 로 비교하면 왜 false가 나오나요?", "## 하려던 것\n입력받은 문자열이 \"yes\"인지 확인하려고 했어요.\n\n## 코드\n```java\nScanner sc = new Scanner(System.in);\nString answer = sc.next();\nif (answer == \"yes\") {\n    System.out.println(\"OK\");\n}\n```\n\n## 결과\n`yes`를 입력해도 아무것도 출력되지 않아요.\n\n## 시도해 본 것\n- 공백이 들어갔나 싶어서 `trim()`도 해봤는데 똑같아요.", ago(0, 5), { template: "question", is_solved: true }),
    P(3, 4, "link", "sql", "JOIN 한 번에 이해하기 (그림으로 정리)", "INNER / LEFT / RIGHT JOIN을 벤 다이어그램 말고 실제 테이블 예시로 정리해 봤어요.", ago(0, 9), { link_url: "https://velog.io/@example/sql-join" }),
    P(4, 1, "question", "c", "scanf 쓰면 다음 입력이 건너뛰어져요", "## 하려던 것\n숫자를 입력받고 이어서 문자를 입력받으려고 했어요.\n\n## 코드\n```c\nint n; char c;\nscanf(\"%d\", &n);\nscanf(\"%c\", &c);\n```\n\n## 결과\n두 번째 입력을 기다리지 않고 바로 넘어가요.", ago(1, 3), { template: "question" }),
    P(5, 2, "note", "java", "주간 회고 · 2주차", "## 이번 주 목표\n- [x] 클래스와 객체\n- [x] 생성자\n- [ ] 상속\n\n## 잘한 점\n매일 30분은 꼭 했다.\n\n## 아쉬운 점\n상속은 예제만 따라 치고 이해를 못 했다.\n\n## 다음 주 목표\n- [ ] 상속, 다형성\n- [ ] 인터페이스", ago(1, 20), { template: "retro" }),
    P(6, 5, "link", "web", "HTML 시맨틱 태그 정리", "", ago(2, 4), { link_url: "https://tistory.com/example" }),
    P(7, 1, "note", "sql", "[문제] 프로그래머스 - 최댓값 구하기", "**문제 링크:** https://programmers.co.kr\n\n## 접근 방법\n`MAX()` 집계 함수를 쓰면 된다.\n\n## 코드\n```sql\nSELECT MAX(DATETIME) AS 시간\nFROM ANIMAL_INS;\n```\n\n## 배운 점\n- 별칭은 `AS`로 붙인다", ago(2, 8), { template: "problem" }),
    P(8, 6, "note", "java", "객체지향이 뭔지 내 말로 설명해 보기", "> 한 줄 요약: 데이터와 그 데이터를 다루는 기능을 한 덩어리(객체)로 묶는 것\n\n## 설명\n붕어빵 틀(클래스)로 붕어빵(객체)을 찍어내는 비유가 제일 와닿았다.", ago(3), { template: "concept" }),
    P(9, 4, "note", "python", "TIL · 리스트 컴프리헨션", "```python\nsquares = [x * x for x in range(10) if x % 2 == 0]\n```\n짝수의 제곱만 한 줄로!", ago(4), { template: "til" }),
    P(10, 3, "note", "c", "TIL · 반복문으로 별 찍기", "```c\nfor (int i = 1; i <= 5; i++) {\n    for (int j = 0; j < i; j++) printf(\"*\");\n    printf(\"\\n\");\n}\n```", ago(5), { template: "til" }),
  ];

  // 히트맵이 비어 보이지 않도록 지난 기록을 조금 더 채움
  const fillers: [number, number, Language, string][] = [
    [1, 1, "c", "TIL · 구조체 기초"], [1, 3, "sql", "TIL · WHERE와 HAVING 차이"], [1, 4, "c", "TIL · 함수 포인터 맛보기"],
    [1, 6, "c", "TIL · 동적 할당 malloc"], [1, 7, "sql", "TIL · GROUP BY"], [1, 9, "c", "TIL · 문자열 함수"],
    [1, 10, "c", "TIL · 재귀 함수"], [1, 13, "sql", "TIL · 서브쿼리"], [1, 15, "c", "TIL · 비트 연산"],
    [1, 16, "c", "TIL · 파일 입출력"], [1, 20, "sql", "TIL · ORDER BY"], [1, 24, "c", "TIL · 배열 기초"],
    [2, 3, "java", "TIL · 접근 제어자"], [2, 6, "java", "TIL · static"], [2, 8, "java", "TIL · 배열 복사"],
    [4, 2, "python", "TIL · 딕셔너리"], [4, 6, "sql", "TIL · LEFT JOIN"], [5, 9, "web", "TIL · flexbox"],
  ];
  fillers.forEach(([a, d, lang, title], i) =>
    posts.push(P(11 + i, a, "note", lang, title, "오늘 공부한 내용 정리!", ago(d, 12), { template: "til" })),
  );

  const comments: DB["comments"] = [
    { id: 1, post_id: 2, author_id: id(1), body: "`==`는 두 변수가 **같은 객체를 가리키는지** 비교해요. 내용을 비교하려면 `equals()`를 써야 해요!\n\n```java\nif (answer.equals(\"yes\")) { ... }\n```", is_accepted: true, created_at: ago(0, 4) },
    { id: 2, post_id: 2, author_id: id(6), body: "저도 이거 헷갈렸는데 덕분에 이해했어요 🙏", is_accepted: false, created_at: ago(0, 3) },
    { id: 3, post_id: 1, author_id: id(3), body: "sizeof 차이 예제 좋네요! 저도 따라 해볼게요.", is_accepted: false, created_at: ago(0, 1) },
    { id: 4, post_id: 4, author_id: id(4), body: "앞 입력의 엔터(\\n)가 버퍼에 남아서 그래요. `scanf(\" %c\", &c);` 처럼 앞에 공백을 넣어 보세요.", is_accepted: false, created_at: ago(1, 1) },
  ];

  const reactions: DB["reactions"] = [
    { post_id: 1, user_id: id(2), emoji: "like", created_at: ago(0) },
    { post_id: 1, user_id: id(3), emoji: "idea", created_at: ago(0) },
    { post_id: 1, user_id: id(4), emoji: "fire", created_at: ago(0) },
    { post_id: 2, user_id: id(3), emoji: "idea", created_at: ago(0) },
    { post_id: 3, user_id: id(1), emoji: "idea", created_at: ago(0) },
    { post_id: 3, user_id: id(2), emoji: "like", created_at: ago(0) },
    { post_id: 5, user_id: id(1), emoji: "fire", created_at: ago(1) },
  ];

  const thisWeek = weekStart();
  const lastWeek = weekStart(new Date(), -1);
  const G = (n: number, user: number, title: string, done: boolean, week: string): Goal => ({
    id: n,
    user_id: id(user),
    title,
    done,
    week_start: week,
    created_at: ago(2),
  });
  const goals: Goal[] = [
    G(1, 1, "포인터 챕터 끝까지 읽기", true, thisWeek),
    G(2, 1, "SQL 문제 10개 풀기", false, thisWeek),
    G(3, 1, "이중 포인터 예제 직접 짜보기", false, thisWeek),
    G(4, 1, "구조체 복습", false, lastWeek),
    G(5, 1, "백준 5문제", true, lastWeek),
    G(6, 2, "상속·다형성 이해하기", false, thisWeek),
    G(7, 2, "자바의 정석 7장", true, thisWeek),
    G(8, 3, "반복문 문제 20개", false, thisWeek),
  ];

  return { profiles, posts, comments, reactions, goals, seq: { posts: 100, comments: 100, goals: 100 } };
}

const g = globalThis as unknown as { __demoDb?: DB };
function db(): DB {
  if (!g.__demoDb) g.__demoDb = seed();
  return g.__demoDb;
}

const authorOf = (uid: string) => {
  const p = db().profiles.find((x) => x.id === uid);
  return p ? { id: p.id, display_name: p.display_name, avatar_url: p.avatar_url } : null;
};

/** 테이블별로 조인된 모양을 붙여서 돌려줌 (select 문자열은 무시) */
function hydrate(table: string, row: Row): Row {
  const d = db();
  if (table === "posts") {
    const id = row.id as number;
    return {
      ...row,
      author: authorOf(row.author_id as string),
      comments: [{ count: d.comments.filter((c) => c.post_id === id).length }],
      reactions: d.reactions.filter((r) => r.post_id === id).map((r) => ({ emoji: r.emoji, user_id: r.user_id })),
    };
  }
  if (table === "comments") return { ...row, author: authorOf(row.author_id as string) };
  return { ...row };
}

type Filter = (r: Row) => boolean;

class DemoQuery implements PromiseLike<{ data: unknown; error: null | { message: string } }> {
  private filters: Filter[] = [];
  private orders: { col: string; asc: boolean }[] = [];
  private max?: number;
  private mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload?: Row;
  private one: "single" | "maybe" | null = null;

  constructor(private table: keyof Omit<DB, "seq">) {}

  select() {
    return this;
  }
  insert(row: Row) {
    this.mode = "insert";
    this.payload = row;
    return this;
  }
  upsert(row: Row) {
    this.mode = "upsert";
    this.payload = row;
    return this;
  }
  update(row: Row) {
    this.mode = "update";
    this.payload = row;
    return this;
  }
  delete() {
    this.mode = "delete";
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  match(obj: Row) {
    Object.entries(obj).forEach(([k, v]) => this.eq(k, v));
    return this;
  }
  gte(col: string, val: string) {
    this.filters.push((r) => String(r[col]) >= val);
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orders.push({ col, asc: opts?.ascending ?? true });
    return this;
  }
  limit(n: number) {
    this.max = n;
    return this;
  }
  single() {
    this.one = "single";
    return this;
  }
  maybeSingle() {
    this.one = "maybe";
    return this;
  }

  private run(): unknown {
    const d = db();
    const rows = d[this.table] as unknown as Row[];
    const match = (r: Row) => this.filters.every((f) => f(r));

    if (this.mode === "insert" || this.mode === "upsert") {
      const now = new Date().toISOString();
      let row: Row = { ...this.payload, created_at: now };
      if (this.table === "posts") {
        row = { is_solved: false, template: null, link_url: null, ...row, id: ++d.seq.posts, updated_at: now };
      } else if (this.table === "comments") {
        row = { is_accepted: false, ...row, id: ++d.seq.comments };
      } else if (this.table === "goals") {
        row = { done: false, ...row, id: ++d.seq.goals };
      } else if (this.table === "reactions") {
        const dup = rows.some((r) => r.post_id === row.post_id && r.user_id === row.user_id && r.emoji === row.emoji);
        if (dup) return null;
      }
      rows.push(row);
      return this.one ? { id: row.id } : [row];
    }
    if (this.mode === "update") {
      rows.filter(match).forEach((r) => Object.assign(r, this.payload, this.table === "posts" ? { updated_at: new Date().toISOString() } : {}));
      return null;
    }
    if (this.mode === "delete") {
      const keep = rows.filter((r) => !match(r));
      rows.length = 0;
      rows.push(...keep);
      if (this.table === "posts") {
        const ids = new Set(keep.map((p) => p.id));
        d.comments = d.comments.filter((c) => ids.has(c.post_id));
        d.reactions = d.reactions.filter((r) => ids.has(r.post_id));
      }
      return null;
    }

    let out = rows.filter(match);
    if (this.orders.length) {
      out = [...out].sort((a, b) => {
        for (const o of this.orders) {
          const x = a[o.col] as string | number | boolean;
          const y = b[o.col] as string | number | boolean;
          if (x === y) continue;
          return (x > y ? 1 : -1) * (o.asc ? 1 : -1);
        }
        return 0;
      });
    }
    if (this.max !== undefined) out = out.slice(0, this.max);
    const hydrated = out.map((r) => hydrate(this.table, r));
    if (this.one) return hydrated[0] ?? null;
    return hydrated;
  }

  then<A, B>(
    onFulfilled?: ((v: { data: unknown; error: null | { message: string } }) => A | PromiseLike<A>) | null,
    onRejected?: ((e: unknown) => B | PromiseLike<B>) | null,
  ) {
    let result: { data: unknown; error: null | { message: string } };
    try {
      const data = this.run();
      result =
        this.one === "single" && data === null && this.mode === "select"
          ? { data: null, error: { message: "not found" } }
          : { data, error: null };
    } catch (e) {
      result = { data: null, error: { message: String(e) } };
    }
    return Promise.resolve(result).then(onFulfilled, onRejected);
  }
}

export function createDemoClient() {
  return {
    from: (table: string) => new DemoQuery(table as keyof Omit<DB, "seq">),
    rpc: async (fn: string, args: { target_comment_id: number }) => {
      if (fn === "accept_answer") {
        const d = db();
        const c = d.comments.find((x) => x.id === args.target_comment_id);
        const post = c && d.posts.find((p) => p.id === c.post_id);
        if (!c || !post || post.author_id !== DEMO_USER_ID || post.kind !== "question") {
          return { data: null, error: { message: "본인 질문의 답변만 채택할 수 있어요" } };
        }
        d.comments.filter((x) => x.post_id === c.post_id).forEach((x) => (x.is_accepted = x.id === c.id));
        post.is_solved = true;
      }
      return { data: null, error: null };
    },
    auth: {
      getClaims: async () => ({ data: { claims: { sub: DEMO_USER_ID } }, error: null }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ data: null, error: null }),
    },
  };
}
