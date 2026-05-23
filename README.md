# WorkTrace - 可视化工作台

面向央企行政人员的任务管理工具。

## 功能特性

- 📅 **月历视图**：左侧月历，点击日期切换查看任务
- ✅ **任务管理**：添加、编辑、删除任务
- ⚡ **快速添加**：任务列表顶部输入一句话，回车创建任务
- 🎯 **四象限分类**：紧急重要/紧急不重要/重要不紧急/不重要不紧急
- 📊 **视图体系**：今日 / 本周 / 本月 / 四象限 / 报表
- 📝 **周报/月报**：从报表入口选择周报或月报，支持复制到剪贴板和导出文本文件
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
│   ├── preload.cjs    # 白名单能力接口
│   ├── database.cjs   # SQLite 数据库
│   ├── repositories/  # 数据访问层：task.repository.cjs
│   └── modules/       # IPC 业务模块：task/stats/report/reminder
├── shared/            # 主进程共享定义：domain/date
├── src/               # React 前端
│   ├── components/    # React 组件
│   ├── modules/       # 前端功能模块声明
│   ├── services/      # 前端能力服务封装
│   ├── shared/        # 渲染进程共享定义：domain/date
│   ├── App.jsx        # 主应用壳层
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
npm.cmd ci

# 重新编译 native 模块 (Electron)
node_modules\.bin\electron-rebuild.cmd -f -w better-sqlite3

# 启动开发服务器和 Electron
npm.cmd start
```

### 生产构建

```bash
npm.cmd run build
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
- 在任务列表顶部输入框输入一句话，按 `Enter`：快速创建任务
- 快速输入支持：`今天`、`明天`、`后天`、`周X/星期X`、`X月X日`、`[紧急]`、`[重要]`
- 在本周/本月视图点击某一天：回到今日视图并预填该日期的快速添加文本
- 右键点击任务：显示上下文菜单
- 点击任务上的编辑按钮：修改任务
- 点击任务上的删除按钮：删除任务
- `Ctrl+N`：新建任务
- `Ctrl+1~4`：切换今日 / 本周 / 本月 / 四象限
- `Delete`：删除选中任务
- `Enter`：编辑选中任务
- `Esc`：关闭弹窗

## 项目交接记录：v0.4

交接时间：2026-05-24

当前状态：模块 1 MVP、Phase 1、Phase 2、Phase 3、Phase 4、Phase 5 中的快捷键/右键菜单边界已完成；v0.4 的视图体系调整、低耦合重构和快速添加已完成；**v0.4.1 已完成 repository 层职责分离（toggleStatus 业务逻辑从数据层上提到模块层）**。模块 5 知识库接口在 SPEC 中标注为远期，当前未开发。

### 已完成内容

1. 模块 1 MVP
   - Electron + React + Tailwind + SQLite 架构。
   - 左侧月历 + 右侧任务列表。
   - 任务增删改查。
   - 四象限分类和统计。
   - 状态流转。
   - 周统计。

2. Phase 1 基础修复
   - `task:update` 已更新 `due_date` 和 `remind_at`。
   - `task:add` 已支持写入 `remind_at`。
   - 任务弹窗已支持截止日期和提醒时间。

3. Phase 2 周报/月报
   - 新增 `electron/modules/report.module.cjs`。
   - 新增 `src/services/reportService.js`。
   - 新增 `ReportPanel.jsx`、`WeeklyReport.jsx`、`MonthlyReport.jsx`。
   - 支持周报、月报、复制到剪贴板、导出文本文件。
   - 月报支持周度趋势。

4. Phase 3 四象限看板
   - 新增 `task:getByQuadrant` IPC。
   - 新增 `src/components/QuadrantBoard.jsx`。
   - 新增并接入 `@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities`。
   - 右侧 tab 已加入“看板”。
   - 拖拽任务卡片到其他象限后，会调用 `task:update` 更新 `quadrant`。
   - 拖拽距离设置为 5px，拖拽中卡片半透明并带阴影。

5. Phase 4 提醒引擎
   - 新增 `electron/modules/reminder.module.cjs`。
   - 新增 `src/services/reminderService.js`。
   - 新增 IPC：
     - `reminder:check`
     - `reminder:setSnooze`
   - 主进程每分钟检查一次到期提醒。
   - 到期任务触发 Electron 系统通知。
   - 点击通知会前置窗口、切到“今日”视图并高亮任务。
   - 任务弹窗已加入提醒预设按钮：
     - 1小时后
     - 明天9:00
     - 下周一9:00

6. Phase 5 体验项
   - 已实现快捷键：
     - `Ctrl+N`
     - `Ctrl+1~4`
     - `Delete`
     - `Enter`
     - `Esc`
   - 已修复右键菜单跑出屏幕的问题。
   - 已修复右键菜单状态流转逻辑。

7. v0.4 视图体系和低耦合重构
   - Tab 调整为：今日 / 本周 / 本月 / 四象限 / 报表。
   - 报表入口通过模块 `navChildren` 提供周报/月报选择。
   - 四象限侧栏预览通过模块 `sidebarWidgets` 贡献，不再写死在 `App.jsx`。
   - 新增 `electron/repositories/task.repository.cjs`，集中管理 `tasks` 表 SQL。
   - 新增 `src/shared/date.js` 和 `shared/date.cjs`，统一日期解析、格式化和周/月范围规则。
   - `electron/preload.cjs` 已收紧为白名单能力接口，不再暴露通用 `invoke(channel)`。

8. 快速添加任务
   - 新增 `task:quickAdd` IPC。
   - `TaskList.jsx` 顶部新增常驻快速输入框。
   - 支持一句话创建任务：
     - `今天`
     - `明天`
     - `后天`
     - `周X/星期X`
     - `X月X日`
     - `[紧急]`
     - `[重要]`
   - 本周/本月视图点击日期格，会回到今日视图并预填该日期。
   - 快速创建后的任务可点击进入编辑弹窗继续补充信息。

9. 构建配置修复
   - `tailwind.config.js` 已补充扫描路径。
   - 生产构建不会再因为 `content: []` 丢失 Tailwind 样式。

### 没有完成的内容

1. 模块 5 知识库接口
   - 未做导出到 Dify。
   - 未做向量库或 AI 检索。
   - 未做年度总结或职业知识库接口。

2. Phase 5 中的远期体验项
   - 未做动画过渡专项打磨。
   - 未做窗口常驻。
   - 未做最小化到托盘。

3. 打包发布
   - 未接入 `electron-builder` 打包脚本。
   - 未生成安装包。

4. 自动化测试
   - 当前项目没有测试框架。
   - 本轮只做构建验证、模块加载验证和开发启动验证。

### 已验证

1. 依赖安装
   - 已执行 `npm.cmd ci`。
   - 已执行 `npm.cmd install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`。

2. 生产构建
   - 已执行 `npm.cmd run build`。
   - 构建通过。

3. 模块加载
   - 已执行 `node -e "require('./shared/date.cjs'); require('./electron/repositories/task.repository.cjs'); require('./electron/modules/task.module.cjs'); require('./electron/modules/stats.module.cjs'); require('./electron/modules/report.module.cjs'); require('./electron/modules/reminder.module.cjs'); console.log('modules ok')"`。
   - 共享日期工具、任务 repository、任务/统计/报表/提醒模块可正常加载。

4. v0.4 接口验证
   - 已用内存 SQLite 验证 `task:getByWeek`、`task:getByMonth`、`task:getByQuadrant`、`stats:getQuadrant`、`report:weekly`。
   - 已验证 `task:quickAdd` 可解析日期关键词和 `[紧急]` / `[重要]`。

5. 浏览器冒烟
   - 已验证快速输入框显示正常。
   - 已验证本周/本月日期点击可预填快速输入框。
   - 已验证报表子菜单和四象限侧栏跳转可用。

6. Electron 开发启动
   - 已执行 `npm.cmd start`。
   - 如遇 `better-sqlite3` ABI 不匹配，执行：

```bash
node_modules\.bin\electron-rebuild.cmd -f -w better-sqlite3
```

### 运行注意事项

Windows PowerShell 下优先使用：

```bash
npm.cmd ci
node_modules\.bin\electron-rebuild.cmd -f -w better-sqlite3
npm.cmd start
```

如果重新安装依赖、升级 Electron 或删除 `node_modules`，需要重新执行：

```bash
node_modules\.bin\electron-rebuild.cmd -f -w better-sqlite3
```

否则可能出现：

```text
better_sqlite3.node was compiled against a different Node.js version
```

### 下一步建议

1. 为模块 5 明确知识库接口边界。
2. 接入 `electron-builder` 并生成 Windows 安装包。
3. 补最小自动化测试，优先覆盖 IPC 模块。
4. 继续打磨 Phase 5：托盘、窗口常驻、动画过渡。
