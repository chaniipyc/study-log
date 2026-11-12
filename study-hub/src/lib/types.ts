export type Language = "c" | "java" | "sql" | "python" | "web" | "etc";
export type PostKind = "note" | "link" | "question";
export type Emoji = "like" | "idea" | "fire";

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  languages: Language[];
  goal: string;
  weekly_target: number;
  created_at: string;
};

export type Goal = {
  id: number;
  user_id: string;
  title: string;
  done: boolean;
  week_start: string;
  created_at: string;
};

export type Post = {
  id: number;
  author_id: string;
  kind: PostKind;
  template: string | null;
  language: Language;
  title: string;
  body: string;
  link_url: string | null;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
};

export type PostWithMeta = Post & {
  author: Pick<Profile, "id" | "display_name" | "avatar_url"> | null;
  comments: { count: number }[];
  reactions: { emoji: Emoji; user_id: string }[];
};

export type Comment = {
  id: number;
  post_id: number;
  author_id: string;
  body: string;
  is_accepted: boolean;
  created_at: string;
  author: Pick<Profile, "id" | "display_name" | "avatar_url"> | null;
};

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "c", label: "C" },
  { value: "java", label: "Java" },
  { value: "sql", label: "SQL" },
  { value: "python", label: "Python" },
  { value: "web", label: "Web" },
  { value: "etc", label: "기타" },
];

export const LANGUAGE_LABEL: Record<Language, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.value, l.label]),
) as Record<Language, string>;

export const KIND_LABEL: Record<PostKind, string> = {
  note: "기록",
  link: "블로그",
  question: "질문",
};

export const EMOJIS: { value: Emoji; label: string }[] = [
  { value: "like", label: "좋아요" },
  { value: "idea", label: "배웠어요" },
  { value: "fire", label: "응원해요" },
];
