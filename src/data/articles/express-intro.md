---
title: "Node.js Express 快速入门"
date: "2024-02-15"
tags: ["Node.js", "Express", "后端", "API"]
category: "技术教程"
excerpt: "使用 Express 快速构建 Node.js Web 应用，学习路由、中间件、API 开发等核心概念。"
---

# Node.js Express 快速入门

Express 是一个简洁而灵活的 Node.js Web 应用框架，提供了强大的一系列功能用于构建 Web 和移动应用。

## 快速开始

### 安装 Express

```bash
npm init -y
npm install express
```

### Hello World

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
```

## 路由

### 基本路由

```javascript
// GET 请求
app.get('/users', (req, res) => {
  res.json({ message: '获取用户列表' });
});

// POST 请求
app.post('/users', (req, res) => {
  res.json({ message: '创建用户' });
});

// PUT 请求
app.put('/users/:id', (req, res) => {
  res.json({ message: `更新用户 ${req.params.id}` });
});

// DELETE 请求
app.delete('/users/:id', (req, res) => {
  res.json({ message: `删除用户 ${req.params.id}` });
});
```

### 路由参数

```javascript
// 路径参数
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId });
});

// 查询参数
app.get('/search', (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  res.json({ query: q, page, limit });
});
```

## 中间件

### 使用内置中间件

```javascript
// 解析 JSON
app.use(express.json());

// 解析 URL 编码
app.use(express.urlencoded({ extended: true }));
```

### 自定义中间件

```javascript
// 日志中间件
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

app.use(logger);

// 认证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }
  
  // 验证 token
  if (token === 'valid-token') {
    next();
  } else {
    res.status(403).json({ error: '禁止访问' });
  }
};

app.use('/api/protected', authMiddleware);
```

### 第三方中间件

```bash
npm install cors morgan helmet compression
```

```javascript
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
```

## RESTful API 示例

### 项目结构

```
project/
├── routes/
│   ├── users.js
│   └── posts.js
├── middleware/
│   └── auth.js
├── models/
│   └── User.js
└── app.js
```

### 用户路由

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

// 模拟数据
let users = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
];

// 获取所有用户
router.get('/', (req, res) => {
  res.json(users);
});

// 获取单个用户
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json(user);
});

// 创建用户
router.post('/', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'name 和 email 是必填项' });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

// 更新用户
router.put('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  
  res.json(user);
});

// 删除用户
router.delete('/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  const deleted = users.splice(index, 1);
  res.json(deleted[0]);
});

module.exports = router;
```

### 主应用

```javascript
// app.js
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/users', userRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 文件上传

```bash
npm install multer
```

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({
    message: '上传成功',
    file: req.file,
  });
});
```

## 数据库集成（MongoDB）

```bash
npm install mongoose
```

```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// 使用示例
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});
```

## 总结

Express 是学习 Node.js 后端开发的绝佳起点。掌握路由、中间件和 RESTful API 设计，你就能够构建强大的 Web 应用了。
