---
title: "React Hooks 完全指南"
date: "2024-01-15"
tags: ["React", "Hooks", "前端"]
category: "技术教程"
excerpt: "深入理解 React Hooks 的使用，包括 useState、useEffect、useContext 等常用 Hook 的最佳实践。"
---

# React Hooks 完全指南

React Hooks 是 React 16.8 引入的新特性，让你在不编写 class 的情况下使用 state 和其他 React 特性。

## 为什么使用 Hooks？

在 Hooks 出现之前，我们在 React 中只能使用 Class 组件来处理状态和生命周期。Hooks 的出现带来了以下优势：

1. **更简洁的代码** - 不需要编写 class，代码更简洁
2. **逻辑复用** - 可以轻松抽取和复用状态逻辑
3. **更好的组合** - 可以将相关逻辑组织在一起

## 常用 Hooks

### useState

`useState` 是最基本的 Hook，用于在函数组件中添加状态。

```typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

### useEffect

`useEffect` 用于处理副作用，比如数据获取、订阅或手动修改 DOM。

```typescript
import { useState, useEffect } from 'react';

function Example() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 组件挂载时执行
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data));

    // 可选的清理函数
    return () => {
      // 组件卸载时执行
      console.log('cleanup');
    };
  }, []); // 依赖数组为空，只在挂载时执行

  return <div>{JSON.stringify(data)}</div>;
}
```

### useContext

`useContext` 用于订阅 React context，避免层层传递 props。

```typescript
import { useContext } from 'react';
import { ThemeContext } from './theme';

function ThemedButton() {
  const theme = useContext(ThemeContext);
  
  return (
    <button style={{ background: theme.background, color: theme.color }}>
      主题按钮
    </button>
  );
}
```

## 自定义 Hooks

你可以创建自己的 Hooks 来复用状态逻辑：

```typescript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
```

## 最佳实践

1. **只在顶层调用 Hooks** - 不要在循环、条件或嵌套函数中调用 Hooks
2. **只在 React 函数中调用** - 不要在普通 JavaScript 函数中调用 Hooks
3. **使用 ESLint 插件** - 使用 `eslint-plugin-react-hooks` 自动检查规则
4. **合理拆分组件** - 当组件变得复杂时，考虑拆分成更小的组件

## 总结

React Hooks 是现代 React 开发的核心特性。掌握 Hooks 的使用，可以让你写出更简洁、更易维护的 React 代码。
