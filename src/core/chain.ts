/**
 * 因果链内核：历史课程的数据模型与图算法。
 *
 * 这门课的主角不是年表，而是**因果关系**：事件节点之间要标明
 * 「因为什么、所以什么」。所以数据模型的主体是一条有向图：
 * 事件（节点）+ 因果边（带类型与一句话理由），时间轴只是这张图的一个看法。
 *
 * 设计约束：
 * - 纯数据 + 纯函数，不碰 DOM / store，所以能直接单测；
 * - 历史不是严格 DAG（存在互为因果的反身因果），环只**报**不删；
 * - 数据里的年份是整数，负数表示公元前（无 0 年）。
 */

export interface Actor {
  id: string;
  name: string;
  /** 生年，负数为公元前 */
  birth?: number;
  /** 卒年，负数为公元前 */
  death?: number;
  role: string;
  note?: string;
}

export interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

/** 事件在时间轴上的分类：起因 / 枢纽 / 后果 */
export type EventRole = "cause" | "core" | "effect";

export interface ChainEvent {
  id: string;
  /** 年份（整数，负数为公元前） */
  year: number;
  title: string;
  /** 一句话说清这个事件本身 */
  summary: string;
  role: EventRole;
  placeId?: string;
  actorIds: string[];
}

/** 因果边的类型：不同的「导致」强度不同，课程里要标出来 */
export type EdgeKind = "caused" | "enabled" | "triggered" | "revealed";

export interface CausalEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  /** 因果理由：为什么是这个因、那个果 */
  note: string;
}

export interface ChainCourse {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  era: string;
  events: ChainEvent[];
  edges: CausalEdge[];
  actors: Actor[];
  places: Place[];
}

/** 边的中文标签与配色语义 */
export const EDGE_LABELS: Record<EdgeKind, string> = {
  caused: "直接导致",
  enabled: "使之可能",
  triggered: "触发",
  revealed: "暴露了",
};

/* ------------------------------------------------------------------ *
 * 校验：课程数据是手写的，错了要能当场指出而不是渲染成玄学
 * ------------------------------------------------------------------ */

export interface ChainIssue {
  level: "error" | "warn";
  message: string;
}

/** 校验课程：悬空的边、重复 id、孤立事件、指向自己的边 */
export function validateCourse(course: ChainCourse): ChainIssue[] {
  const issues: ChainIssue[] = [];
  const ids = new Set<string>();
  for (const e of course.events) {
    if (ids.has(e.id)) issues.push({ level: "error", message: `事件 id 重复：${e.id}` });
    ids.add(e.id);
  }
  const actorIds = new Set(course.actors.map((a) => a.id));
  const placeIds = new Set(course.places.map((p) => p.id));
  for (const e of course.events) {
    for (const a of e.actorIds) {
      if (!actorIds.has(a)) issues.push({ level: "error", message: `事件「${e.title}」引用了不存在的人物 ${a}` });
    }
    if (e.placeId && !placeIds.has(e.placeId)) {
      issues.push({ level: "error", message: `事件「${e.title}」引用了不存在的地点 ${e.placeId}` });
    }
  }
  const edgeSeen = new Set<string>();
  for (const ed of course.edges) {
    if (!ids.has(ed.from)) issues.push({ level: "error", message: `因果边的起点事件不存在：${ed.from}` });
    if (!ids.has(ed.to)) issues.push({ level: "error", message: `因果边的终点事件不存在：${ed.to}` });
    if (ed.from === ed.to) issues.push({ level: "error", message: `事件「${ed.from}」因果指向了自己` });
    const key = `${ed.from}->${ed.to}`;
    if (edgeSeen.has(key)) issues.push({ level: "warn", message: `重复的因果边 ${key}` });
    edgeSeen.add(key);
    if (!ed.note.trim()) issues.push({ level: "warn", message: `因果边 ${key} 没写理由` });
  }
  const linked = new Set<string>();
  for (const ed of course.edges) {
    linked.add(ed.from);
    linked.add(ed.to);
  }
  for (const e of course.events) {
    if (!linked.has(e.id)) issues.push({ level: "warn", message: `事件「${e.title}」没有连任何因果边` });
  }
  return issues;
}

/* ------------------------------------------------------------------ *
 * 图算法
 * ------------------------------------------------------------------ */

/** 按年份升序（同年保持数据里的先后） */
export function sortEvents(events: ChainEvent[]): ChainEvent[] {
  return events
    .map((e, i) => ({ e, i }))
    .sort((a, b) => a.e.year - b.e.year || a.i - b.i)
    .map((x) => x.e);
}

/** 事件的出边（它导致了谁） */
export function outgoingEdges(course: ChainCourse, eventId: string): CausalEdge[] {
  return course.edges.filter((e) => e.from === eventId);
}

/** 事件的入边（谁导致了它） */
export function incomingEdges(course: ChainCourse, eventId: string): CausalEdge[] {
  return course.edges.filter((e) => e.to === eventId);
}

/** 与某事件直接相连的边（它因谁 + 它因谁） */
export function relatedEdges(course: ChainCourse, eventId: string): CausalEdge[] {
  return course.edges.filter((e) => e.from === eventId || e.to === eventId);
}

/** 与某事件直接相连的事件 id（含自身）：时间轴高亮与详情面板共用这一份 */
export function relatedEventIds(course: ChainCourse, eventId: string): Set<string> {
  const set = new Set<string>([eventId]);
  for (const e of relatedEdges(course, eventId)) {
    set.add(e.from);
    set.add(e.to);
  }
  return set;
}

/** 沿因果方向可达的全部下游事件 id */
export function descendantsOf(course: ChainCourse, eventId: string): Set<string> {
  const out = new Map<string, string[]>();
  for (const e of course.edges) {
    const list = out.get(e.from) ?? [];
    list.push(e.to);
    out.set(e.from, list);
  }
  const seen = new Set<string>();
  const stack = [...(out.get(eventId) ?? [])];
  while (stack.length) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const nxt of out.get(cur) ?? []) stack.push(nxt);
  }
  return seen;
}

/** 沿因果方向回溯到的全部上游事件 id */
export function ancestorsOf(course: ChainCourse, eventId: string): Set<string> {
  const inc = new Map<string, string[]>();
  for (const e of course.edges) {
    const list = inc.get(e.to) ?? [];
    list.push(e.from);
    inc.set(e.to, list);
  }
  const seen = new Set<string>();
  const stack = [...(inc.get(eventId) ?? [])];
  while (stack.length) {
    const cur = stack.pop()!;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const prv of inc.get(cur) ?? []) stack.push(prv);
  }
  return seen;
}

/**
 * 找出因果图里的环。
 *
 * 历史里环是可能的（甲的做法埋下乙的因，乙又反过来逼出甲的后续），
 * 所以这里只**报告**，不当作错误。返回每条环上的事件 id 序列。
 */
export function detectCycles(course: ChainCourse): string[][] {
  const adj = new Map<string, string[]>();
  for (const e of course.edges) {
    const list = adj.get(e.from) ?? [];
    list.push(e.to);
    adj.set(e.from, list);
  }
  const color = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];
  const cycles: string[][] = [];
  const seenCycle = new Set<string>();

  const dfs = (node: string) => {
    color.set(node, 1);
    stack.push(node);
    for (const nxt of adj.get(node) ?? []) {
      const c = color.get(nxt) ?? 0;
      if (c === 0) dfs(nxt);
      else if (c === 1) {
        const start = stack.indexOf(nxt);
        if (start >= 0) {
          const cycle = stack.slice(start);
          const key = [...cycle].sort().join("|");
          if (!seenCycle.has(key)) {
            seenCycle.add(key);
            cycles.push(cycle);
          }
        }
      }
    }
    stack.pop();
    color.set(node, 2);
  };

  for (const e of course.events) if ((color.get(e.id) ?? 0) === 0) dfs(e.id);
  return cycles;
}

/**
 * 时间轴分层：每个事件的层号 = 它上游最长的路径长度。
 *
 * 没有上游的事件在第 0 层，因果链一环扣一环往下排 —— 时间轴上因此
 * 能看出「谁垫在谁上面」，而不是一条平铺的直线。
 */
export function layerOf(course: ChainCourse): Map<string, number> {
  const events = sortEvents(course.events);
  const layer = new Map<string, number>();
  const visiting = new Set<string>();
  const depth = (id: string): number => {
    const known = layer.get(id);
    if (known !== undefined) return known;
    if (visiting.has(id)) return 0; // 环：就地截断，避免无限递归
    visiting.add(id);
    let best = 0;
    for (const e of incomingEdges(course, id)) best = Math.max(best, depth(e.from) + 1);
    visiting.delete(id);
    layer.set(id, best);
    return best;
  };
  for (const e of events) depth(e.id);
  return layer;
}

/** 时间轴布局：x 按年份线性映射，y 按层位；同层同年的事件左右错开 */
export interface LayoutNode {
  event: ChainEvent;
  x: number;
  y: number;
  layer: number;
}

export interface LayoutOptions {
  width: number;
  height: number;
  /** 年份跨度映射到的像素宽度 */
  span?: number;
  padding?: number;
  layerHeight?: number;
}

/** 计算时间轴布局。返回的坐标是 SVG 用户坐标（左上原点）。 */
export function layoutTimeline(course: ChainCourse, opt: LayoutOptions): LayoutNode[] {
  const events = sortEvents(course.events);
  if (!events.length) return [];
  const padding = opt.padding ?? 72;
  const layerHeight = opt.layerHeight ?? 96;
  const years = events.map((e) => e.year);
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  const span = Math.max(1, maxY - minY);
  const usable = Math.max(1, opt.width - padding * 2);
  const layer = layerOf(course);
  const layers = [...new Set(events.map((e) => layer.get(e.id) ?? 0))].sort((a, b) => a - b);
  const maxLayer = layers.length ? layers[layers.length - 1] : 0;
  const height = Math.max(opt.height, padding * 2 + maxLayer * layerHeight);

  /* 同层的事件若年份挨得太近会叠在一起：按 x 排序后逐个推开 */
  const byLayer = new Map<number, ChainEvent[]>();
  for (const e of events) {
    const l = layer.get(e.id) ?? 0;
    const list = byLayer.get(l) ?? [];
    list.push(e);
    byLayer.set(l, list);
  }

  const out: LayoutNode[] = [];
  for (const [l, list] of byLayer) {
    const raw = list.map((e) => ({
      event: e,
      x: padding + ((e.year - minY) / span) * usable,
      y: Math.min(padding + l * layerHeight, height - padding),
      layer: l,
    }));
    raw.sort((a, b) => a.x - b.x);
    const minGap = 96;
    for (let i = 1; i < raw.length; i++) {
      if (raw[i].x - raw[i - 1].x < minGap) raw[i].x = raw[i - 1].x + minGap;
    }
    /* 推开的溢出右边界时整体左移，保持在画布内 */
    const overflow = raw.length ? raw[raw.length - 1].x + padding - opt.width : 0;
    if (overflow > 0) for (const r of raw) r.x -= overflow;
    out.push(...raw);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 格式化
 * ------------------------------------------------------------------ */

/** 年份文案：负数是公元前，无 0 年（1 年前接公元前 1 年） */
export function formatYear(year: number): string {
  if (year < 0) return `公元前 ${-year} 年`;
  return `${year} 年`;
}

/** 年份区间文案 */
export function formatSpan(from: number, to: number): string {
  if (from === to) return formatYear(from);
  return `${formatYear(from)} – ${formatYear(to)}`;
}
