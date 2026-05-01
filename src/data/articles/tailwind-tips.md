---
title: "Tailwind CSS 实用技巧"
date: "2024-02-10"
tags: ["Tailwind CSS", "CSS", "前端"]
category: "技术教程"
excerpt: "学习 Tailwind CSS 的实用技巧，包括自定义配置、响应式设计、暗色模式等高级用法。"
---

# Tailwind CSS 实用技巧

Tailwind CSS 是一个功能类优先（utility-first）的 CSS 框架，可以快速构建自定义的用户界面。

## 为什么使用 Tailwind？

### 传统 CSS 的问题

```css
/* 需要想类名 */
.chat-container { }
.chat-message { }
.chat-message-author { }
```

### Tailwind 的解决方案

```html
<div class="flex items-center space-x-4">
  <img class="h-12 w-12 rounded-full" src="/avatar.jpg" />
  <div class="font-medium">John Doe</div>
</div>
```

## 自定义配置

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
      },
    },
  },
  plugins: [],
};
```

### 使用自定义值

```html
<div class="bg-primary-500 text-white p-4">
  使用自定义颜色
</div>

<div class="font-sans text-lg">
  使用自定义字体
</div>

<div class="animate-bounce-slow">
  使用自定义动画
</div>
```

## 响应式设计

Tailwind 使用断点前缀来实现响应式：

```html
<div class="
  grid
  grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
">
  <!-- 响应式网格布局 -->
</div>
```

### 默认断点

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 移动端优先

```html
<!-- 默认移动端样式，大屏幕覆盖 -->
<button class="
  w-full
  md:w-auto
  px-4 py-2
  bg-blue-500
  hover:bg-blue-600
">
  按钮
</button>
```

## 暗色模式

### 配置

```javascript
module.exports = {
  darkMode: 'class', // 或 'media'
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
      },
    },
  },
};
```

### 使用

```html
<!-- class 策略 -->
<div class="bg-white dark:bg-background-dark">
  <p class="text-gray-900 dark:text-gray-100">
    暗色模式文本
  </p>
</div>
```

```typescript
// 切换暗色模式
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}
```

## 常用模式

### 卡片布局

```html
<div class="max-w-sm rounded-lg overflow-hidden shadow-lg">
  <img class="w-full h-48 object-cover" src="/image.jpg" />
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">卡片标题</div>
    <p class="text-gray-700 text-base">
      卡片内容描述...
    </p>
  </div>
  <div class="px-6 pt-4 pb-2">
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
      #标签
    </span>
  </div>
</div>
```

### 导航栏

```html
<nav class="bg-white shadow-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <a href="/" class="text-xl font-bold">Logo</a>
      </div>
      <div class="flex items-center space-x-4">
        <a href="/about" class="text-gray-700 hover:text-blue-500">
          关于
        </a>
        <a href="/contact" class="text-gray-700 hover:text-blue-500">
          联系
        </a>
      </div>
    </div>
  </div>
</nav>
```

### 表单

```html
<form class="space-y-6">
  <div>
    <label class="block text-sm font-medium text-gray-700">
      邮箱
    </label>
    <input
      type="email"
      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">
      密码
    </label>
    <input
      type="password"
      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>

  <button
    type="submit"
    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    登录
  </button>
</form>
```

## 性能优化

### PurgeCSS

Tailwind 会自动移除未使用的样式（生产环境）：

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  // 生产构建时自动清除未使用的类
};
```

### JIT 模式

Tailwind 3.0+ 默认使用 JIT（Just-In-Time）编译：

```bash
# 按需生成样式，文件更小，速度更快
```

## 与 CSS 预处理器结合

### 使用 @apply

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

```html
<button class="btn-primary">按钮</button>
```

## 总结

Tailwind CSS 提供了强大的工具类，可以让你快速构建美观的界面。关键是多练习，熟悉常用的类名组合。
