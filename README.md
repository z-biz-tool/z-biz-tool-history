# z-biz-tool-history · ChronoLab 历史因果实验室

时间轴 + 地图上串起人物一生的**因 → 果**链，可走进场景的历史学习工作台。

## 定位

历史课程的核心是**因果关系**，不是年表背诵：事件节点之间要明确标出「因为什么、所以什么」，
时间轴与地图回答「何时何地」，因果链回答「为何如此」，场景导览让学习者「走进去看」。

家族第 19 个仓（product-local），Tauri 2 + React 19 + AntD 6 + Zustand 5 + Vite 6。

## 开发

```bash
npm install        # 家族现状：npm + package-lock.json（与 math/music 同）
npm run dev        # vite，dev 端口 5201
npm test           # node --experimental-strip-types --test tests/*.test.ts
npm run typecheck  # tsc --noEmit
npm run tauri dev  # 桌面壳（需要先 npm run dev 或让 beforeDevCommand 拉起）
```

## 已实现（P0）

- **因果链内核** `src/core/chain.ts`：事件节点 + 因果边（类型 + 理由）、课程校验（悬空边/孤立事件/自指边）、
  环检测（历史里环是可能的，只报不删）、祖先/后代遍历、时间轴分层布局、年份格式化（负数=公元前）。
- **示例课程** `src/data/courses.ts`：两门课（工业革命的连锁、安史之乱的崩溃链），
  每条边都写清「因为什么、所以什么」；取材按通行史学口径。
- **时间轴视图** `src/ui/Timeline.tsx`：横轴年份、纵轴因果层级（上游垫在下层），
  点节点即高亮它的因与果；右侧 `EventPanel.tsx` 整句露出边的理由。
- **课程栏** `src/ui/CoursePanel.tsx`：选课、导言、数据自检结果当场摊开。

路线图：P1 地图视图 + 人物生平卡；P2 场景化穿越导览 + 课程预设库。

## 深链

`zbiz://history/open?course=<courseId>&from=<sender>` —— `course` 定位到具体课程
（id 见 `src/data/courses.ts`），不存在时报「没有这门课程 X」而不是静默吞掉。
人物 / 单条因果链的定位参数待课程数据模型定型后再扩。

## 组织接入

- manifest 登记：`z-biz-tool-lead/003_辅助能力/bootstrap/manifest.json`
- 深链产品白名单：`z-biz-tool-capability/crates/cap-hub/src/manifest.rs` 的 `PRODUCT_IDS`
- 端口分配记录：`z-biz-tool-lead/002_项目需求/projects/z-biz-tool-history.md`
- 图标链：唯一作者输入 `assets/app-icon.svg`（沙漏母题），生成物 `src-tauri/icons/**` 禁止手改
