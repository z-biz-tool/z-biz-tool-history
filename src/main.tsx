import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import UpdaterGate from "./components/UpdaterDialog";
import "./index.css";

/** 课程数据都在内存与本地工程里，白屏等于让用户找不到刚串到一半的因果链 */
class Boundary extends Component<{ children: ReactNode }, { err: string | null }> {
  state: { err: string | null } = { err: null };

  static getDerivedStateFromError(e: unknown) {
    return { err: e instanceof Error ? `${e.message}\n${e.stack ?? ""}` : String(e) };
  }

  componentDidCatch(e: unknown) {
    console.error("ChronoLab 渲染失败", e);
  }

  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: "ui-monospace, monospace", fontSize: 12, lineHeight: 1.7 }}>
        <h2 style={{ fontSize: 15 }}>界面渲染出错了</h2>
        <p>工程未受影响；重新载入可回到最近一次的状态。</p>
        <pre style={{ whiteSpace: "pre-wrap", opacity: 0.7 }}>{this.state.err}</pre>
        <button onClick={() => location.reload()}>重新载入</button>
      </div>
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Boundary>
      <App />
      <UpdaterGate />
    </Boundary>
  </StrictMode>,
);
