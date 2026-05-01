---
title: "Vite 构建工具使用指南"
date: "2024-02-01"
tags: ["Vite", "构建工具", "前端工程化"]
category: "工具使用"
excerpt: "了解 Vite 的核心优势，学习如何配置 Vite 项目，以及常用的插件和优化技巧。"
---

# Vite 构建工具使用指南

Vite 是下一代的前端构建工具，由 Vue 作者尤雨溪开发。它利用浏览器原生 ES 模块支持，提供了极速的开发体验。

## 为什么选择 Vite？

### 传统打包工具的问题

在 Vite 出现之前，我们使用 Webpack 等打包工具：

1. **冷启动慢** - 需要打包整个应用才能启动开发服务器
2. **热更新慢** - 修改代码后需要重新打包

### Vite 的解决方案

Vite 利用浏览器原生 ES 模块：

1. **快速冷启动** - 无需打包，按需编译
2. **快速热更新** - 只更新修改的模块

## 快速开始

### 创建项目

```bash
# 使用 npm
npm create vite@latest my-app -- --template react-ts

# 使用 yarn
yarn create vite my-app --template react-ts

# 进入项目目录
cd my-app

# 安装依赖
npm install
```

### 启动开发服务器

```bash
npm run dev
```

## 配置 Vite

### 基础配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### 环境变量

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    define: {
      __DEV__: JSON.stringify(isDev),
    },
  };
});
```

创建环境变量文件：

```bash
# .env
VITE_API_URL=https://api.example.com

# .env.development
VITE_API_URL=http://localhost:3001

# .env.production
VITE_API_URL=https://api.prod.com
```

## 常用插件

### 官方插件

```bash
# React 支持
npm install @vitejs/plugin-react -D

# Vue 支持
npm install @vitejs/plugin-vue -D

# TypeScript 支持（内置）
```

### 社区插件

```bash
# 路径别名
npm install @rollup/plugin-alias -D

# 压缩
npm install vite-plugin-compression -D

# HTML 模板
npm install vite-plugin-html -D
```

使用示例：

```typescript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
    }),
  ],
});
```

## 生产构建

### 构建命令

```bash
npm run build
```

### 构建配置

```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@/components/ui'],
        },
      },
    },
  },
});
```

### 代码分割

Vite 会自动进行代码分割：

- `vendor` - node_modules 中的依赖
- 动态导入的模块会单独分割

手动配置代码分割：

```typescript
// 动态导入
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 路由级别分割
const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));
```

## 优化技巧

### 1. 预构建依赖

```typescript
export default defineConfig({
  optimizeDeps: {
    include: ['lodash', 'axios'],
    exclude: ['my-custom-lib'],
  },
});
```

### 2. 处理大图

```typescript
// 图片自动压缩
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 20 },
      pngquant: { quality: [0.8, 0.9] },
    }),
  ],
});
```

### 3. CSS 优化

```typescript
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
```

## 部署

### 静态部署

```bash
npm run build
# 将 dist 目录部署到任何静态服务器
```

### Docker 部署

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 总结

Vite 提供了极快的开发体验和强大的构建能力。对于现代前端项目，Vite 是一个非常不错的选择。
