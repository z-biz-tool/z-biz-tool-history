/**
 * zbiz:// 深链接的 **history 语义层**。
 *
 * ## 分工
 *
 * | 层 | 在哪 | 管什么 |
 * |----|----|--------|
 * | 协议 | `z-biz-tool-shared/protocol` | 字节级编解码（金标 = Rust `cap-hub`） |
 * | 机制 | `z-biz-tool-shared/protocol` 的 `startDeepLinkReceiver` | 冷启动补取、事件监听、不静默吞掉 |
 * | **语义** | **本文件** | **收到深链后 history 该做什么** |
 *
 * ## 支持的动作
 *
 * | action | 含义 |
 * |--------|------|
 * | `open` | 进入/唤到前台（缺省 action） |
 *
 * ## 支持的参数
 *
 * | 参数 | 作用 |
 * |------|------|
 * | `course` | 打开指定课程（id 见 `src/data/courses.ts`），不存在时报「没有这门课程 X」 |
 * | `from` | 发送方，仅用于日志与回执 |
 *
 * 人物 / 单条因果链的定位参数待课程数据模型定型后再扩，白名单放这里，纯函数可直接单测。
 */

import { COURSES } from "../data/courses.ts";
import type { Handoff } from "z-biz-tool-shared/protocol";

/** history 的动作白名单 */
export const HISTORY_ACTIONS: readonly string[] = ["open"];

/** history 的深链结果 */
export interface HistoryDeepLinkOutcome {
  /** 要打开的课程 id；null 表示不带定位意图 */
  courseId: string | null;
  /** 发送方（from），仅用于提示与日志 */
  from: string | null;
  /** 无法适配时的原因 */
  problem: string | null;
}

/**
 * 把一条深链翻译成 history 内的动作。
 *
 * 纯函数 —— 不碰 store、不碰 Tauri，所以可以直接单测。
 */
export function resolveHistoryDeepLink(item: Handoff): HistoryDeepLinkOutcome {
  const outcome: HistoryDeepLinkOutcome = {
    courseId: null,
    from: item.params.from ?? null,
    problem: null,
  };

  const action = item.action.trim() || "open";
  if (!(HISTORY_ACTIONS as readonly string[]).includes(action)) {
    outcome.problem = `不认识的动作 ${action}`;
    return outcome;
  }

  const rawCourse = item.params.course?.trim() ?? "";
  if (rawCourse) {
    if (COURSES.some((c) => c.id === rawCourse)) {
      outcome.courseId = rawCourse;
    } else {
      outcome.problem = `没有这门课程 ${rawCourse}`;
      return outcome;
    }
  }

  return outcome;
}
