import { strict as assert } from "node:assert";
import { test } from "node:test";

import { resolveHistoryDeepLink } from "../src/_shared/deepLink.ts";

test("缺省 action 归一为 open，不报问题", () => {
  const out = resolveHistoryDeepLink({ product: "history", action: "", params: {} });
  assert.equal(out.problem, null);
  assert.equal(out.courseId, null);
  assert.equal(out.from, null);
});

test("open 带发送方时回带 from", () => {
  const out = resolveHistoryDeepLink({ product: "box", action: "open", params: { from: "box" } });
  assert.equal(out.problem, null);
  assert.equal(out.from, "box");
});

test("未知动作报问题（不静默吞掉）", () => {
  const out = resolveHistoryDeepLink({ product: "history", action: "jump", params: {} });
  assert.match(out.problem ?? "", /jump/);
});

test("course 参数定位到真实存在的课程", () => {
  const out = resolveHistoryDeepLink({
    product: "history",
    action: "open",
    params: { course: "anshi-rebellion" },
  });
  assert.equal(out.problem, null);
  assert.equal(out.courseId, "anshi-rebellion");
});

test("不存在的课程 id 报错，不静默吞掉", () => {
  const out = resolveHistoryDeepLink({
    product: "history",
    action: "open",
    params: { course: "no-such-course" },
  });
  assert.match(out.problem ?? "", /no-such-course/);
  assert.equal(out.courseId, null);
});
