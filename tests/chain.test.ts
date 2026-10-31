/**
 * 因果链内核测试：校验、环检测、祖先/后代、分层布局、年份格式化，
 * 外加「随包发布的两门示例课程必须自洽」这一条回归。
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ancestorsOf,
  descendantsOf,
  detectCycles,
  formatSpan,
  formatYear,
  layerOf,
  layoutTimeline,
  outgoingEdges,
  relatedEdges,
  relatedEventIds,
  sortEvents,
  validateCourse,
  type ChainCourse,
} from "../src/core/chain.ts";
import { COURSES } from "../src/data/courses.ts";

const tiny: ChainCourse = {
  id: "t",
  title: "t",
  subtitle: "",
  summary: "",
  era: "",
  actors: [],
  places: [],
  events: [
    { id: "a", year: 1700, title: "A", summary: "", role: "cause", actorIds: [] },
    { id: "b", year: 1750, title: "B", summary: "", role: "core", actorIds: [] },
    { id: "c", year: 1800, title: "C", summary: "", role: "effect", actorIds: [] },
  ],
  edges: [
    { from: "a", to: "b", kind: "caused", note: "因为 A 所以 B" },
    { from: "b", to: "c", kind: "enabled", note: "因为 B 所以 C" },
  ],
};

test("校验：悬空边、悬空人物、孤立事件、自指边都要报出来", () => {
  const bad: ChainCourse = {
    ...tiny,
    events: [
      ...tiny.events,
      { id: "d", year: 1850, title: "D", summary: "", role: "cause", actorIds: ["nope"] },
      { id: "e", year: 1860, title: "E", summary: "", role: "cause", actorIds: [] },
    ],
    edges: [
      ...tiny.edges,
      { from: "a", to: "ghost", kind: "caused", note: "指向不存在的事件" },
      { from: "d", to: "d", kind: "caused", note: "自己指向自己" },
    ],
  };
  const msgs = validateCourse(bad).map((i) => i.message);
  assert.ok(msgs.some((m) => m.includes("ghost")), "悬空终点未报");
  assert.ok(msgs.some((m) => m.includes("不存在的人物")), "悬空人物未报");
  assert.ok(msgs.some((m) => m.includes("因果指向了自己")), "自指边未报");
  assert.ok(msgs.some((m) => m.includes("没有连任何因果边")), "孤立事件未报");
});

test("校验：边缺理由只算 warn，不算错误", () => {
  const issues = validateCourse({
    ...tiny,
    edges: [{ from: "a", to: "b", kind: "caused", note: "  " }],
  });
  assert.equal(issues.filter((i) => i.level === "error").length, 0);
  assert.ok(issues.some((i) => i.level === "warn" && i.message.includes("没写理由")));
});

test("排序：年份升序，公元前为负数排在最前", () => {
  const sorted = sortEvents([
    { id: "x", year: -500, title: "", summary: "", role: "cause", actorIds: [] },
    { id: "y", year: 100, title: "", summary: "", role: "cause", actorIds: [] },
    { id: "z", year: -50, title: "", summary: "", role: "cause", actorIds: [] },
  ]);
  assert.deepEqual(sorted.map((e) => e.id), ["x", "z", "y"]);
});

test("祖先与后代：沿因果方向双向可达", () => {
  assert.deepEqual([...descendantsOf(tiny, "a")].sort(), ["b", "c"]);
  assert.deepEqual([...ancestorsOf(tiny, "c")].sort(), ["a", "b"]);
  assert.equal(descendantsOf(tiny, "c").size, 0);
  assert.equal(outgoingEdges(tiny, "a").length, 1);
});

test("环检测：互为因果的环要报出来（历史里环是可能的，不当错误）", () => {
  const looped: ChainCourse = {
    ...tiny,
    edges: [
      ...tiny.edges,
      { from: "c", to: "a", kind: "revealed", note: "反过来又逼出 A" },
    ],
  };
  const cycles = detectCycles(looped);
  assert.equal(cycles.length, 1);
  assert.deepEqual([...cycles[0]].sort(), ["a", "b", "c"]);
  assert.equal(validateCourse(looped).filter((i) => i.level === "error").length, 0);
});

test("分层：上游最长路径决定层号，因果链因此能看出上下关系", () => {
  const layer = layerOf(tiny);
  assert.equal(layer.get("a"), 0);
  assert.equal(layer.get("b"), 1);
  assert.equal(layer.get("c"), 2);
});

test("布局：同层挨太近的事件要推开，且不越出画布", () => {
  const dense: ChainCourse = {
    ...tiny,
    events: [
      { id: "p", year: 1800, title: "P", summary: "", role: "cause", actorIds: [] },
      { id: "q", year: 1801, title: "Q", summary: "", role: "cause", actorIds: [] },
      { id: "r", year: 1802, title: "R", summary: "", role: "cause", actorIds: [] },
    ],
    edges: [],
  };
  const nodes = layoutTimeline(dense, { width: 900, height: 400 });
  const row = nodes.filter((n) => n.layer === 0).sort((a, b) => a.x - b.x);
  assert.equal(row.length, 3);
  assert.ok(row[1].x - row[0].x >= 96, `相邻间距不足：${row[1].x - row[0].x}`);
  assert.ok(nodes.every((n) => n.x >= 0 && n.x <= 900), "有节点越出画布");
});

test("布局：不同年份映射到不同横坐标，层号映射到纵坐标", () => {
  const nodes = layoutTimeline(tiny, { width: 1000, height: 500 });
  const byId = new Map(nodes.map((n) => [n.event.id, n]));
  assert.ok((byId.get("c")!.x > byId.get("a")!.x), "年份靠后的应更靠右");
  assert.ok(byId.get("c")!.y > byId.get("a")!.y, "层号高的应更靠下");
});

test("关联边与关联事件：选中一个事件时，因与果两侧都要能取到", () => {
  assert.equal(relatedEdges(tiny, "b").length, 2);
  assert.deepEqual([...relatedEventIds(tiny, "b")].sort(), ["a", "b", "c"]);
  assert.deepEqual([...relatedEventIds(tiny, "a")].sort(), ["a", "b"]);
});

test("年份文案：负数为公元前，区间两端同则只写一次", () => {
  assert.equal(formatYear(-221), "公元前 221 年");
  assert.equal(formatYear(1492), "1492 年");
  assert.equal(formatSpan(1492, 1492), "1492 年");
  assert.equal(formatSpan(-221, 0), "公元前 221 年 – 0 年");
});

test("随包发布的两门示例课程必须自洽：无结构错误、无孤立事件", () => {
  assert.equal(COURSES.length, 2);
  for (const c of COURSES) {
    const errors = validateCourse(c).filter((i) => i.level === "error");
    assert.deepEqual(errors.map((e) => e.message), [], `${c.title} 有结构错误`);
    const warns = validateCourse(c).filter((i) => i.level === "warn");
    assert.deepEqual(warns.map((w) => w.message), [], `${c.title} 有告警`);
    assert.ok(c.events.length >= 8, `${c.title} 事件太少`);
    assert.ok(c.edges.length >= 8, `${c.title} 因果边太少`);
    /* 每条边都要写清理由：这是本产品的核心表达 */
    for (const e of c.edges) assert.ok(e.note.length >= 8, `边 ${e.from}->${e.to} 理由太短`);
  }
});
