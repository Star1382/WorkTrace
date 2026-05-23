# WorkTrace - 可视化工作台

面向央企行政人员的任务管理工具。

## 功能特性

- 📅 **月历视图**：左侧月历，点击日期切换查看任务
- ✅ **任务管理**：添加、编辑、删除任务
- 🎯 **四象限分类**：紧急重要/紧急不重要/重要不紧急/不重要不紧急
- 📊 **统计功能**：四象限统计、本周完成统计
- 💾 **本地存储**：SQLite数据库，数据安全

## 技术栈

- Electron 33
- React 18
- Tailwind CSS 3
- SQLite (better-sqlite3)
- Vite 5

## 项目结构

```
worktrace/
├── electron/          # Electron 主进程
│   ├── main.cjs       # 主进程入口
│   ├── preload.cjs    # 预加载脚本
│   └── database.cjs   # SQLite 数据库
├── src/               # React 前端
│   ├── components/    # React 组件
│   ├── App.jsx        # 主应用
│   ├── main.jsx       # 入口文件
│   └── index.css      # 样式
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 运行命令

### 开发模式

```bash
# 安装依赖
npm install

# 重新编译 native 模块 (Electron)
npx electron-rebuild

# 启动开发服务器和 Electron
npm start
```

### 生产构建

```bash
npm run build
```

## 数据存储

数据库位置：
- Linux: `~/.config/worktrace/worktrace.db`
- macOS: `~/Library/Application Support/worktrace/worktrace.db`
- Windows: `%APPDATA%\worktrace\worktrace.db`

## 状态说明

- `todo`: 待办
- `in_progress`: 进行中
- `done`: 已完成
- `stuck`: 阻塞
- `cancelled`: 已取消

## 快捷操作

- 点击任务左侧复选框：切换完成状态
- 右键点击任务：显示上下文菜单
- 点击任务上的编辑按钮：修改任务
- 点击任务上的删除按钮：删除任务
