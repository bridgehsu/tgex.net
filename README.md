# TGEX · 交易所设计与业务流程

VitePress 1.6.4 中文文档站，目标域名 `tgex.net`。正文聚焦业务规则、设计架构与流程，不展开具体源码。

## 本地运行

```sh
npm ci
npm run dev
```

## 验证与构建

```sh
npm run check
npm run build
npm run preview
```

构建产物在 `dist/`。源文件在 `docs/`；`navigation.json`、`structure.json`、`content-map.json` 均由 `npm run gen` 根据目录生成，不要手改。首页组件和主题位于 `docs/.vitepress/theme/`。

文档源码采用与 eladmin/vdoing 类似的 `序号.标题` 组织，例如 `docs/07.现货手册/01.业务概述.md`。侧栏显示中文标题（去掉序号）；对外 URL 为 `/pages/0701`（栏目两位序号 + 文两位序号）。修改目录后运行 `npm run gen`。

`docs/pages/`、`docs/assets/` 以及根下同步出的 `index.html` 等为构建产物，已加入 `.gitignore`，由 `npm run build` 生成，不要手改。

## GitHub 自动构建与 Pages 部署

工作流位于 `.github/workflows/build.yml`。推送到 `main`、向 `main` 提交 Pull Request 时自动运行，也可以在 GitHub Actions 页面手动触发。

构建顺序：Node.js 22 → `npm ci` → `npm run check` → `npm run build`。成功后上传 `dist/`，产物名为 `tgex-dist-提交SHA`，保留 14 天，可在对应运行页面的 Artifacts 中下载。

查看运行记录：https://github.com/bridgehsu/tgex.net/actions/workflows/build.yml

推送到 `main` 或在 `main` 手动运行时，还会上传 Pages 专用产物并部署至 GitHub Pages；Pull Request 只检查与构建。

首次配置需进入仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。若 Actions 发布不可用，改为 **Deploy from a branch**，分支选 `gh-pages`、目录选 `/ (root)`。在 **Custom domain** 中保留 `tgex.net`，域名校验和证书就绪后启用 **Enforce HTTPS**。

不要选择从 `main /docs` 或仓库根目录进行分支发布。那样会走 GitHub Pages 自带的 Jekyll，把 Markdown 当正文渲染，Vue 组件不会编译，首页只剩标题，文档页也没有 VitePress 侧栏和样式。

自定义 Actions 部署以 Pages 设置中的域名为准，仓库 `CNAME` 文件不能代替该设置。当前站点使用根路径 `/`，适用于 `https://tgex.net/`；如果改用 `/tgex.net/` 仓库子路径，需同时适配 VitePress base 和自定义组件链接。

## 内容边界

60 篇文档覆盖 18 个栏目。模块映射、现货订单类型和状态、订单簿结构及部分期权状态已对照工程检查；业务图为流程抽象，一致性、安全和恢复设计不代表生产功能已完成审计。示例价格、收益与费率仅用于演算。

不包含项目原有账号、内部服务地址、密钥或真实业务数据。接口章节说明协议语义，不虚构尚未核实的接口路径。

## 部署到 tgex.net

1. 将 `dist/` 上传到支持静态文件的托管服务。
2. 在托管侧绑定 `tgex.net`，按服务商要求设置 A、AAAA 或 CNAME 记录。
3. 配置 TLS 证书和 HTTP 到 HTTPS 跳转。
4. 支持 `/pages/070501` 这样的无扩展名路由：先尝试同名 `.html`，未找到时返回 `404.html`，不要把所有未知路径重写成首页。
5. 验证首页、文档深链接、搜索、移动端和 404。

Sitemap 已使用 `https://tgex.net`。写入域名元数据不代表已注册域名或完成 DNS 绑定。Sites 预览发布默认保留私有访问范围。

Nginx 参考配置位于 `deploy/nginx.conf`，域名与证书需在你的托管环境完成配置。
