import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    /* dev 端口 5201：5173/1420/5199/5200 已被家族占用（分配记录见
       z-biz-tool-lead/002_项目需求/projects/z-biz-tool-history.md） */
    port: 5201,
    strictPort: false,
  },
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        /* 界面库占产物大头，与运行时、自有代码分开发，改内核不必让用户重下一份 antd */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          const ui = /[/\\](antd|@ant-design|rc-[^/\\]+|@rc-component)[/\\]/.test(id);
          return ui ? "ui" : "runtime";
        },
      },
    },
  },
});
