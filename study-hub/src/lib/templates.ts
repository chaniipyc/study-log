import type { PostKind } from "./types";

export type Template = {
  id: string;
  name: string;
  hint: string;
  kind: PostKind;
  title: string;
  body: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "til",
    name: "TIL",
    hint: "오늘 배운 것 한 장 정리",
    kind: "note",
    title: "TIL · ",
    body: `## 오늘 배운 것
- 

## 헷갈렸던 것
- 

## 예제 코드
\`\`\`c

\`\`\`

## 내일 할 것
- [ ] `,
  },
  {
    id: "concept",
    name: "개념 정리",
    hint: "개념 하나를 내 말로 설명하기",
    kind: "note",
    title: "",
    body: `> 한 줄 요약: 

## 설명


## 예제
\`\`\`java

\`\`\`

## 주의할 점
- `,
  },
  {
    id: "problem",
    name: "문제풀이",
    hint: "알고리즘·SQL 문제 풀이 기록",
    kind: "note",
    title: "[문제] ",
    body: `**문제 링크:** 

## 접근 방법


## 코드
\`\`\`sql

\`\`\`

## 배운 점 / 복잡도
- `,
  },
  {
    id: "retro",
    name: "주간 회고",
    hint: "이번 주 돌아보기",
    kind: "note",
    title: "주간 회고 · ",
    body: `## 이번 주 목표
- [x] 
- [ ] 

## 잘한 점


## 아쉬운 점


## 다음 주 목표
- [ ] `,
  },
  {
    id: "question",
    name: "질문",
    hint: "막힌 부분을 물어보기",
    kind: "question",
    title: "",
    body: `## 하려던 것


## 코드
\`\`\`c

\`\`\`

## 에러 메시지 / 결과
\`\`\`

\`\`\`

## 시도해 본 것
- `,
  },
];
