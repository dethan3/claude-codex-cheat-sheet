# agent-cheat-sheets

这个仓库现在定位为“终端 Agent / Coding CLI 速查表合集”。

当前已收录：

- `Claude Code`
- `OpenAI Codex`
- `Gemini CLI`
- `GitHub Copilot CLI`
- `Cursor CLI`
- `Cline CLI`
- `OpenCode CLI`

所有产品共用同一套静态页面壳、打印友好布局和少量交互；页面内可以直接切换产品、`中文 / English` 和 `macOS / Windows` 键位展示。

当前资料核对时间：

- Claude Code：`2026-03-26`
- OpenAI Codex：`2026-03-27`
- Gemini CLI：`2026-03-30`
- GitHub Copilot CLI：`2026-03-30`
- Cursor CLI：`2026-03-30`
- Cline CLI：`2026-03-30`
- OpenCode CLI：`2026-03-30`

## 特点

- 最终产物是静态单页，生成后可直接双击打开
- 内容源使用 `JSON` 维护，方便后续同步和翻译
- 保留统一的四栏速查布局
- 保留 A4 横向打印样式，可导出单页 PDF
- 保留 Mac / Windows 键位切换
- 顶部 toolbar 独立于正文卡片，打印时自动隐藏
- 保留 `NEW` 徽标自动过期逻辑
- 去除了外部统计脚本
- 产品按钮与生成入口页都已改成数据驱动，后续继续加 Agent CLI 只需要补数据文件和清单

## 文件结构

- `data/catalog.json`：产品顺序、页面入口与数据文件清单
- `data/claude.json`：Claude Code 页面结构化数据源
- `data/codex.json`：OpenAI Codex 页面结构化数据源
- `data/gemini.json`：Gemini CLI 页面结构化数据源
- `data/copilot.json`：GitHub Copilot CLI 页面结构化数据源
- `data/cursor.json`：Cursor CLI 页面结构化数据源
- `data/cline.json`：Cline CLI 页面结构化数据源
- `data/opencode.json`：OpenCode CLI 页面结构化数据源
- `data/translations.en.json`：英文界面的映射表，未命中的字符串会回退到中文
- `index.html`：统一页面壳，默认打开 Claude Code
- `claude-code.html` / `openai-codex.html` / `gemini-cli.html` / `github-copilot-cli.html` / `cursor-cli.html` / `cline-cli.html` / `opencode-cli.html`：各产品默认入口
- `codex.html`：保留的 Codex 兼容入口
- `scripts/build-pages.mjs`：从 JSON 重新生成所有 HTML 页面
- `styles.css`：页面样式和响应式/打印样式
- `script.js`：页面渲染、产品切换、语言切换、键位切换与 `NEW` 徽标逻辑

## 本地使用

最简单的方式是直接用浏览器打开 `index.html` 或任一产品入口页。
这些入口页只是默认产品不同，页面内都可以切换产品和语言。

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

生成后的 HTML 页面都可以直接用浏览器打开。
如果你需要分享某个默认视图，也可以带查询参数，例如：

```bash
index.html?product=cursor&lang=en
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
- 其余页面以各产品官方文档、CLI 帮助输出或官方参考页核对时的状态为准
- GitHub Copilot CLI 官方文档当前注明其 CLI 仍处于 `public preview`
