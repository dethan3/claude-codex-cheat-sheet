# Claude / Codex 速查表

这个仓库现在包含两张可直接打开的单页速查表：

- `index.html`：对 [cc.storyfox.cz](https://cc.storyfox.cz/) 的中文本地化复刻，内容是 Claude Code
- `codex.html`：基于 OpenAI 官方文档和 `codex --help` 整理的 OpenAI Codex 中文速查表

两页共用同一套排版、打印友好布局和少量交互。
现在 `index.html` 和 `codex.html` 共用同一个动态页面壳，只是默认选中的产品不同；页面内可以直接切换 `Claude Code / Codex`、`中文 / English` 和 `macOS / Windows`。

当前内容基于以下资料状态整理：

- Claude Code `v2.1.84`
- 最近更新时间：`2026-03-26`
- Codex 文档核对时间：`2026-03-27`

## 特点

- 最终产物是静态单页，生成后可直接双击打开
- 内容源使用 `JSON` 维护，方便后续同步和翻译
- 保留原站四栏速查布局
- 保留 A4 横向打印样式，可导出单页 PDF
- 保留 Mac / Windows 键位切换
- 顶部 toolbar 独立于正文卡片，打印时自动隐藏
- 保留 `NEW` 徽标自动过期逻辑
- 去除了外部统计脚本

## 文件结构

- `data/claude.json`：Claude Code 页面结构化数据源
- `data/codex.json`：OpenAI Codex 页面结构化数据源
- `data/translations.en.json`：英文界面的映射表，未命中的字符串会回退到中文
- `index.html`：统一页面壳，默认打开 Claude Code
- `codex.html`：统一页面壳，默认打开 OpenAI Codex
- `scripts/build-pages.mjs`：从 JSON 重新生成两个 HTML 页面
- `styles.css`：页面样式和响应式/打印样式
- `script.js`：页面渲染、产品切换、语言切换、键位切换与 `NEW` 徽标逻辑

## 本地使用

最简单的方式是直接用浏览器打开 `index.html` 或 `codex.html`。
两个入口页只是默认产品不同，页面内都可以切换产品和语言。

如果你希望通过本地服务访问，也可以在仓库目录运行：

```bash
python3 -m http.server 4173
```

然后访问：

- `http://localhost:4173`

如果你修改了以下文件，需要重新生成页面：

- `data/*.json`
- `scripts/build-pages.mjs`

```bash
node scripts/build-pages.mjs
```

如果你只修改了 `styles.css` 或 `script.js`，不需要重建 HTML，直接刷新浏览器即可。

生成后的 `index.html` 和 `codex.html` 依然可以直接用浏览器打开。
如果你需要分享某个默认视图，也可以带查询参数，例如：

```bash
index.html?product=codex&lang=en
```

## 打印与 PDF

- 浏览器打印时使用 `A4 landscape`
- 顶部 toolbar、changelog 等非正文元素会自动隐藏
- 设计目标是单页导出 PDF，必要时可在浏览器里关闭页眉页脚

## 翻译原则

- 命令、参数、路径、环境变量、Slash Commands、Skills、Agents 等专有内容尽量保留原文
- 功能描述改写为中文开发者更常用的表达
- 避免逐字硬译，优先保证查阅效率
- 同步上游更新时，优先保留信息结构与查阅节奏，再做中文本地化润色

## 说明

- 这不是官方版本，只是面向中文读者的整理、复刻与翻译
- Claude Code 页面以原站抓取时的状态为准，后续如果原站更新，中文版本需要手动同步
- Codex 页面以 OpenAI 官方文档和本机 CLI 帮助输出核对时的状态为准
