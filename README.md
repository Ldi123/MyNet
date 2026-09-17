# MyNet

> 有趣、好玩的个人网站 & 知识库 — 建立于 2021 年 12 月 8 日

基于 [VuePress 1.x](https://vuepress.vuejs.org/) + 本地主题 `theme-vdoing-1.0`

## 目录结构

```
docs/                 文章与站点配置（Markdown）
  .vuepress/config/   站点 / 主题 / 插件配置
  @pages/             自动生成的分类、标签、归档页
  _posts/             碎片化文章（随笔）
theme-vdoing-1.0/     本地主题源码（可直接修改）
utils/                构建脚本（frontmatter、llms.txt、检索索引等）
tools/ai/             本地 AI 工具（MCP 服务）
```

## 环境要求

- 站点构建：Node 12 / 14
- `tools/ai`（MCP 服务）：Node >= 14

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地预览（会先生成检索索引），访问 `http://localhost:8080/MyNet/` |
| `npm run build` | 构建静态站点，并生成 `dist/llms.txt`、`dist/ai/search-index.json` 等 |
| `npm run deploy` | 构建并部署到 GitHub Pages |
| `npm run editFm` | 按 `utils/config.yml` 批量增删 frontmatter |
| `npm run baiduPush` | 生成并推送百度链接 |

## 写文章约定

- 文件放在 `docs/<分类目录>/` 下，命名为 `NN.标题.md`（`NN` 仅用于排序）或直接 `标题.md`。
- frontmatter 会在 `dev` / `build` 时自动补全（`title`、`date`、`permalink`、`categories`、`tags`），无需手写。
- **日期取 git 首次提交日期**（未提交的新文件用文件修改时间），本地与 CI 一致，不会每次发布被改成"今天"。
- 手动排序：在 frontmatter 加 `order: 15`（稀疏编号）。排序优先级：`order` > 文件名序号 > `date` 降序。

## AI 能力

构建时会生成机器可读产物（检索索引源文件在 `docs/.vuepress/public/ai/`，已 gitignore）：

- `llms.txt` / `llms-full.txt`：站点索引与全文合并，供 LLM 抓取
- `pages/***.md`：每个页面的纯 Markdown 版本
- `ai/search-index.json`：站内全文检索索引

### 站内全文检索

顶部搜索框基于 [MiniSearch](https://github.com/lucaong/minisearch)，支持**正文检索**、中文 bigram 分词与结果排序；索引缺失或加载失败时自动降级为标题 / 标签匹配，不会报错。

> 必须用 `npm run dev` 启动（会先生成索引）；修改文章后需重启 dev 以刷新索引。

### MCP 服务（供本地 AI 工具调用）

`tools/ai/kb-mcp.js` 是一个零依赖的 stdio MCP 服务，让 AI 工具直接检索、读取本知识库，数据全在本地。

```bash
cd tools/ai && npm install        # 首次
node tools/ai/kb-mcp.js --check   # 自检
```

接入 opencode（全局 `~/.config/opencode/opencode.json`）：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-net-kb": {
      "type": "local",
      "command": ["node", "【项目根目录】/tools/ai/kb-mcp.js"],
      "enabled": true,
      "drainStderr": true
    }
  }
}
```

提供的工具：`search_notes`、`get_note`、`list_notes`、`list_categories`、`list_tags`。
数据源、站点地址、排除目录在 `tools/ai/kb.config.json` 中配置。

> MCP 在启动时读取文章，新增 / 修改文章后需重启 MCP（或重开 opencode 会话）才会生效。

## License

MIT
