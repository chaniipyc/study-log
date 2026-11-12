import { cookies } from "next/headers";
import { LAYOUT_COOKIE, toLayout } from "./appearance";

/** 현재 레이아웃(틀). 쿠키에 저장돼 서버 렌더링에서도 바로 반영됨 */
export async function getLayout() {
  const store = await cookies();
  return toLayout(store.get(LAYOUT_COOKIE)?.value);
}
