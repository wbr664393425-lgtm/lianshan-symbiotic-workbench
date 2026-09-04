import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    // 图标改为按需子路径导入（见各组件顶部），dev 下只解析用到的那几十个图标；
    // 整包预打包会产出 6MB 的单块，解析它反而更慢。
    include: [
      "react",
      "react-dom/client",
      "gsap",
      "gsap/Flip",
      "@gsap/react",
    ],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx", "./src/App.jsx", "./src/FilesWorkspace.jsx", "./src/TaskWorkspace.jsx"],
    },
  },
  plugins: [react()],
});
