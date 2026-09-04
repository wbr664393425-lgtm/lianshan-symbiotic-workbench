# PROJECT MAP

## 项目定位

`lianshan-symbiotic-workbench` 是独立的“元枢”共生工作台视觉 Demo。它只负责前端视觉、交互和动效验证，不连接正式后台 Agent 系统。

## 目录

| 路径 | 用途 |
|---|---|
| `src/` | React 页面、工作台组件、动效编排与样式 |
| `public/assets/` | 品牌、伴生体、能量纹理和界面素材 |
| `design-reference/` | 已选视觉方向与设计源图，含任务页原始参考图 |
| `design-qa/`、`qa/`、`audit-*/` | 视觉对照、交互验证与性能证据 |
| `scripts/` | 构建准备、动效检查和素材处理脚本 |
| `tests/` | Sites Worker 自动化测试 |
| `worker/` | 独立预览的 Sites Worker 入口 |
| `.openai/hosting.json` | Sites 交付配置 |
| `AGENTS.md` | 本项目长期视觉与交互决策 |
| `CHANGELOG.md` | 从原工程迁入的完整 Demo 变更记录 |

## 运行链路

`index.html` → `src/main.jsx` → `src/App.jsx` → 首页、任务、资料库和设置工作台。

这是纯前端演示链路。界面中的任务、文件与状态均为本地演示状态，不应据此声称正式后台能力已经接入。
