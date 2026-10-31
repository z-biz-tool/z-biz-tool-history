import { useEffect } from "react";
import { ConfigProvider, theme as antdTheme, App as AntdApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { startDeepLinkReceiver, ZBIZ_TAKE_PENDING } from "z-biz-tool-shared/protocol";
import type { Handoff } from "z-biz-tool-shared/protocol";
import { resolveHistoryDeepLink } from "./_shared/deepLink";
import { useHistory } from "./state.ts";
import Workbench from "./components/Workbench";

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{ algorithm: antdTheme.defaultAlgorithm, token: { colorPrimary: "#F6A623", borderRadius: 8, fontSize: 13 } }}
    >
      <AntdApp style={{ display: "contents" }}>
        <DeepLinkBridge />
        <Workbench />
      </AntdApp>
    </ConfigProvider>
  );
}

/**
 * zbiz:// 深链接线（机制在共享层 startDeepLinkReceiver，语义在本仓 _shared/deepLink.ts）。
 *
 * 必须待在 `<AntdApp>` 内部：message 要走 `App.useApp()`，
 * 静态 message 挂在全局 holder 上，不吃本页 ConfigProvider 的主题。
 */
function DeepLinkBridge() {
  const { message } = AntdApp.useApp();
  useEffect(() => {
    const stop = startDeepLinkReceiver({
      productId: "history",
      invoke: () => invoke<Handoff[]>(ZBIZ_TAKE_PENDING),
      listen: (event, handler) => listen(event, handler),
      translate: (item) => {
        const out = resolveHistoryDeepLink(item);
        if (out.problem) {
          return { ok: false, problem: out.problem };
        }
        return { ok: true, effect: { courseId: out.courseId } };
      },
      onProblem: (msg, item) => {
        // 静默吞掉的话，用户看到的就是「点了没反应」
        console.warn("[history] 收到未适配的深链", item, msg);
        message.warning(msg);
      },
      onEffect: (effect) => {
        const courseId = effect.courseId as string | null;
        if (courseId) useHistory.getState().setCourse(courseId);
        else console.debug("[history] 深链 open：窗口已在前台，无额外动作");
      },
      log: (msg, item) => console.debug("[history] 深链", msg, item),
    });
    return stop;
  }, [message]);
  return null;
}
