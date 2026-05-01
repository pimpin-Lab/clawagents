---
title: "TypeScript 入门教程"
date: "2024-01-20"
tags: ["TypeScript", "JavaScript", "类型系统"]
category: "技术教程"
excerpt: "从零开始学习 TypeScript，理解类型系统的优势，掌握常用类型和高级类型特性。"
---

# TypeScript 入门教程

TypeScript 是 JavaScript 的超集，添加了静态类型系统。它可以帮助你：

- 在编译时发现错误
- 提供更好的 IDE 支持
- 使代码更易于理解和维护

## 基础类型

### 布尔类型

```typescript
let isDone: boolean = false;
```

### 数字类型

```typescript
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;
```

### 字符串类型

```typescript
let color: string = "blue";
let fullName: string = `Hello, ${firstName} ${lastName}`;
```

### 数组

```typescript
let list: number[] = [1, 2, 3];
let genericList: Array<number> = [1, 2, 3];
```

### 元组

```typescript
let x: [string, number];
x = ["hello", 10]; // OK
x = [10, "hello"]; // Error
```

### 枚举

```typescript
enum Color {
  Red,
  Green,
  Blue
}

let c: Color = Color.Green;

// 带初始值的枚举
enum Color2 {
  Red = 1,
  Green,
  Blue
}

let colorName: string = Color2[2]; // "Blue"
```

## 接口

接口定义了对象的形状：

```typescript
interface Person {
  name: string;
  age: number;
  readonly id: number; // 只读属性
  email?: string; // 可选属性
}

function printPerson(person: Person) {
  console.log(`Name: ${person.name}, Age: ${person.age}`);
}

const me: Person = {
  name: "John",
  age: 30,
  id: 12345
};
```

## 类型别名

```typescript
type ID = string | number;
type Point = {
  x: number;
  y: number;
};

function printId(id: ID) {
  console.log(id);
}
```

## 泛型

泛型允许你创建可重用的、与类型无关的代码：

```typescript
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("myString");
let output2 = identity("myString"); // 类型推断

// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

// 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}
```

## 高级类型

### 联合类型

```typescript
type PadLeft = string | number;

function padLeft(value: string, padding: PadLeft) {
  // ...
}
```

### 交叉类型

```typescript
type Person = {
  name: string;
  age: number;
};

type Logger = {
  log: (message: string) => void;
};

type PersonWithLogging = Person & Logger;
```

### 类型守卫

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function example(value: string | number) {
  if (isString(value)) {
    // 在这里 value 的类型是 string
    return value.toUpperCase();
  }
}
```

## 实用工具类型

TypeScript 提供了一些内置的工具类型：

```typescript
// Partial - 使所有属性变为可选
interface Todo {
  title: string;
  description: string;
}

const partialTodo: Partial<Todo> = {
  title: "Clean room"
};

// Pick - 选择特定属性
type TitleOnly = Pick<Todo, "title">;

// Omit - 排除特定属性
type NoDescription = Omit<Todo, "description">;

// Record - 创建对象类型
type PageInfo = Record<string, { title: string }>;
```

## 配置 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## 总结

TypeScript 的类型系统非常强大，可以大大提高代码质量。建议从基础类型开始，逐步学习高级特性。
