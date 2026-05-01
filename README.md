# 技术博客 - Tech Blog

一个基于 React + TypeScript + Vite 构建的现代化技术博客前端项目，使用 Tailwind CSS + shadcn/ui 打造精美界面。

## 在线演示

> 由于是纯前端项目，数据存储在 localStorage 中，可直接部署到任意静态托管平台（GitHub Pages、Vercel、Netlify 等）。

**演示账号：**
- 管理员：`admin@blog.com` / `admin123`
- 普通用户：`user@blog.com` / `user123`

## 功能特性

### 博客功能
- **首页** — Hero 横幅、精选文章轮播、分类导航、最新文章、全文搜索、侧边栏组件
- **文章详情** — Markdown 渲染 + Prism.js 代码高亮（支持 12 种语言）、阅读时间、点赞分享
- **分类浏览** — 6 大分类（前端、后端、数据库、DevOps、移动端、AI & 机器学习）
- **标签系统** — 标签云、按标签筛选文章
- **归档页面** — 按年月分组展示文章

### 用户系统（localStorage）
- 登录 / 注册
- 收藏文章
- 阅读历史（最近 50 条）
- 个人资料编辑

### 管理后台
- 数据概览（统计卡片 + 图表）
- 用户管理（搜索、封禁、解封、删除、角色变更）
- 站点设置

### 资源推荐
- 推荐网站（GitHub、StackOverflow、MDN 等）
- 学习平台（freeCodeCamp、Coursera、B站 等）
- 开发工具（编辑器、设计、调试、部署、终端、数据库）

### 其他
- 深色 / 浅色主题切换
- 响应式设计，适配移动端
- 关于页面（技能展示、时间线）

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2 | UI 框架 |
| TypeScript | 5.9 | 类型安全 |
| Vite | 7.2 | 构建工具 |
| React Router DOM | 7.14 | 客户端路由 |
| Tailwind CSS | 3.4 | 样式方案 |
| shadcn/ui | 55+ 组件 | UI 组件库 |
| Radix UI | — | 无障碍组件基础 |
| Lucide React | 0.562 | 图标库 |
| react-markdown | 10.1 | Markdown 渲染 |
| Prism.js | 1.30 | 代码语法高亮 |
| Recharts | 2.15 | 图表 |
| date-fns | 4.1 | 日期处理 |

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆仓库
git clone -b blog-frontend https://github.com/pimpin-Lab/clawagents.git
cd clawagents

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 构建命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（HMR 热更新） |
| `npm run build` | TypeScript 类型检查 + Vite 生产构建 |
| `npm run lint` | ESLint 代码检查 |
| `npm run preview` | 预览生产构建结果 |

## 项目结构

```
src/
├── components/
│   ├── layout/          # 页面布局（Header, Footer, Layout）
│   └── ui/              # 业务组件 + shadcn/ui 组件库
├── contexts/            # React Context（全局状态）
├── data/                # 静态数据（文章、导航）
├── hooks/               # 自定义 Hooks（主题切换、移动端检测）
├── pages/               # 页面组件（11 个页面）
├── services/            # 业务逻辑服务（认证、用户管理）
├── types/               # TypeScript 类型定义
└── lib/                 # 工具函数
```

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 文章列表、搜索、分类导航 |
| `/article/:slug` | 文章详情 | Markdown 渲染、代码高亮 |
| `/category/:slug` | 分类页 | 按分类筛选文章 |
| `/tag/:tagName` | 标签页 | 按标签筛选文章 |
| `/tags` | 标签云 | 全部标签概览 |
| `/archives` | 归档 | 按年月分组 |
| `/about` | 关于 | 个人介绍 |
| `/profile` | 个人中心 | 收藏、历史、设置 |
| `/admin` | 管理后台 | 用户管理、数据统计 |
| `/resources/websites` | 推荐网站 | 站点链接 |
| `/resources/learning` | 学习平台 | 在线课程平台 |
| `/resources/tools` | 开发工具 | 工具推荐 |

## 部署

项目已配置相对路径（`base: './'`），可直接部署：

**GitHub Pages：**
```bash
npm run build
# 将 dist/ 目录推送到 gh-pages 分支
```

**Vercel / Netlify：**
```bash
# 直接连接 GitHub 仓库，设置构建命令为 npm run build，输出目录为 dist
```

## 许可证

MIT License
