# CHANGELOG

本文档记录 WorkTrace 的主要功能变更、修复和交付状态。

## 2026-05-23 - 模块化边界加固

状态：已按“主体保留接口、功能模块独立接入”的目标，加固前端功能模块注册和共享领域定义。

### Added

- 新增共享领域数据源：`shared/domain.json`。
  - 统一维护任务状态、状态文案、状态符号、待推进状态、四象限定义和四象限文案。
- 新增共享领域封装：
  - `shared/domain.cjs` 供 Electron 主进程模块使用。
  - `src/shared/domain.js` 供 React 前端模块使用。
- 新增前端功能模块目录：`src/modules/`。
- 新增功能模块声明文件：
  - `src/modules/today.module.jsx`
  - `src/modules/board.module.jsx`
  - `src/modules/weekly.module.jsx`
  - `src/modules/monthly.module.jsx`
- 新增前端模块注册入口：`src/modules/index.js`。
  - 使用 `import.meta.glob('./*.module.jsx', { eager: true })` 自动发现功能模块。
  - 功能模块通过 `key`、`label`、`order`、`render(context)` 接入主体。

### Changed

- `src/App.jsx` 不再直接硬编码导入今日、看板、周报、月报视图。
- 主体 tab 和主区域渲染改为读取 `featureModules`。
- 今日、看板、周报、月报被迁移为独立前端功能模块声明。
- `TaskList.jsx`、`TaskModal.jsx`、`QuadrantBoard.jsx`、`ReportPanel.jsx` 改为复用共享任务状态和四象限定义。
- `task.module.cjs`、`stats.module.cjs`、`report.module.cjs`、`reminder.module.cjs` 改为复用共享任务状态定义，减少状态字符串散落。

### Verified

- 已执行生产构建：
  - `npm.cmd run build`
- 已验证 Electron 业务模块可加载：
  - `node -e "require('./electron/modules/task.module.cjs'); require('./electron/modules/stats.module.cjs'); require('./electron/modules/report.module.cjs'); require('./electron/modules/reminder.module.cjs'); console.log('modules ok')"`

## 2026-05-23 - Phase 3/4/5 补齐版

状态：已继续完成 SPEC 中的四象限看板、提醒引擎和主要快捷键体验项。

### Added

- 新增四象限看板组件：`src/components/QuadrantBoard.jsx`。
- 新增任务按象限查询 IPC：`task:getByQuadrant`。
- 新增拖拽依赖：
  - `@dnd-kit/core`
  - `@dnd-kit/sortable`
  - `@dnd-kit/utilities`
- 右侧主区域新增“看板”tab。
- 看板任务卡片支持拖拽到其他象限，并通过 `task:update` 更新 `quadrant`。
- 新增提醒后端模块：`electron/modules/reminder.module.cjs`。
- 新增提醒前端服务：`src/services/reminderService.js`。
- 新增提醒 IPC：
  - `reminder:check`
  - `reminder:setSnooze`
- 主进程新增每分钟提醒轮询。
- 到期提醒会触发 Electron 系统通知。
- 点击通知会前置窗口、切到“今日”视图并高亮对应任务。
- 任务弹窗新增提醒预设按钮：
  - 1小时后
  - 明天9:00
  - 下周一9:00
- 新增快捷键：
  - `Ctrl+N` 新建任务
  - `Ctrl+1~4` 切换今日 / 看板 / 周报 / 月报
  - `Delete` 删除选中任务
  - `Enter` 编辑选中任务
  - `Esc` 关闭弹窗

### Changed

- `electron/modules/index.cjs` 的模块注册支持传入主进程上下文。
- `electron/main.cjs` 向业务模块传入 `getMainWindow`，用于提醒通知点击后前置窗口。
- `electron/preload.cjs` 新增 `electronAPI.on`，用于渲染进程监听主进程事件。
- `TaskList.jsx` 支持选中任务和提醒高亮。
- `README.md` 已更新为当前 SPEC 阶段交接说明。

### Fixed

- 修复 SPEC 中缺失的看板 tab。
- 修复 SPEC 中未落地的提醒检查和贪睡 IPC。
- 修复 SPEC 中未落地的快捷键。

### Verified

- 已执行生产构建：
  - `npm.cmd run build`
- 已验证报表和提醒模块可加载：
  - `node -e "require('./electron/modules/report.module.cjs'); require('./electron/modules/reminder.module.cjs'); console.log('modules ok')"`

### Not Included

- 未实现模块 5 知识库接口。
- 未接入 Dify 或向量库。
- 未做窗口常驻。
- 未做最小化到托盘。
- 未做动画过渡专项打磨。
- 未做打包发布。
- 未新增自动化测试。

## 2026-05-23 - Phase 1/2 交付版

状态：已完成 Phase 1 基础修复和 Phase 2 周报/月报一版实现。

### Added

- 新增周报/月报后端模块：`electron/modules/report.module.cjs`。
- 新增报表 IPC：
  - `report:weekly`
  - `report:monthly`
  - `report:exportText`
  - `report:copyToClipboard`
  - `report:saveToFile`
- 新增前端报表服务：`src/services/reportService.js`。
- 新增报表通用展示组件：`src/components/ReportPanel.jsx`。
- 新增周报视图组件：`src/components/WeeklyReport.jsx`。
- 新增月报视图组件：`src/components/MonthlyReport.jsx`。
- 右侧主区域新增 tab：
  - 今日
  - 周报
  - 月报
- 任务弹窗新增截止日期输入：`due_date`。
- 任务弹窗新增提醒时间输入：`remind_at`。
- 报表支持复制领导汇报文本到系统剪贴板。
- 报表支持导出 `.txt` 文件。
- 月报新增周度趋势统计。
- 报表新增“待推进事项”区域。

### Changed

- 新建任务时，默认截止日期来自当前选中的日历日期。
- 编辑任务时，会回填原有 `due_date` 和 `remind_at`。
- 任务新增、编辑、删除、状态变化后，会刷新任务列表、统计和报表。
- README 已补充 Phase 1/2 项目交接记录。
- README 已更新当前功能特性、项目结构和 Windows 运行命令。
- Tailwind 生产构建扫描路径从空数组改为：
  - `./index.html`
  - `./src/**/*.{js,jsx}`

### Fixed

- 修复 `task:update` 不更新 `due_date` 的问题。
- 修复 `task:update` 不更新 `remind_at` 的问题。
- 修复 `task:add` 不写入 `remind_at` 的问题。
- 修复右键菜单状态流转逻辑：
  - 原逻辑把目标状态当作当前状态处理。
  - 现在复选框完成切换和右键指定状态分开处理。
- 修复右键菜单可能跑出屏幕的问题。
- 修复 Tailwind `content: []` 导致生产 CSS 缺失的问题。
- 修复本地 Electron 启动时 `better-sqlite3` ABI 不匹配问题：
  - 通过 `node_modules\.bin\electron-rebuild.cmd -f -w better-sqlite3` 重编译 native 模块。

### Verified

- 已执行依赖安装：
  - `npm.cmd ci`
- 已执行生产构建：
  - `npm.cmd run build`
- 已验证报表模块可加载：
  - `node -e "require('./electron/modules/report.module.cjs'); console.log('report module ok')"`
- 已验证 Electron 开发启动：
  - `npm.cmd start`
- Electron 主进程已成功加载模块：
  - `report`
  - `stats`
  - `task`
- 数据库初始化路径已确认：
  - `C:\Users\shuiy\AppData\Roaming\worktrace\worktrace.db`

### Not Included

- 未实现 Phase 3 四象限看板。
- 未新增 `task:getByQuadrant`。
- 未新增 `QuadrantBoard.jsx`。
- 未接入 `@dnd-kit/core` 或 `@dnd-kit/sortable`。
- 未实现拖拽改象限、优先级或状态。
- 未实现 Phase 4 提醒引擎。
- 未新增 `reminder:check`。
- 未新增 `reminder:setSnooze`。
- 未实现 Windows 系统通知。
- 未实现快捷键。
- 未实现知识库接口。
- 未接入 Dify 或向量库。
- 未做打包发布。
- 未新增自动化测试。

### Known Notes

- 在 Windows PowerShell 中，`npm` 可能被执行策略拦截，建议使用 `npm.cmd`。
- 如果重新安装依赖、升级 Electron 或删除 `node_modules`，需要重新执行：

```bash
node_modules\.bin\electron-rebuild.cmd -f -w better-sqlite3
```

## 2026-05-23 - 模块 1 MVP

状态：已跑通。

### Added

- Electron + React + Tailwind + SQLite 基础架构。
- 左侧月历 + 右侧任务列表三栏布局。
- 任务增删改查。
- CRUD 通过 Electron IPC 调用 SQLite。
- 四象限分类。
- 标签式任务状态和象限显示。
- 右键菜单切换任务状态。
- 周统计：完成数 / 总数。

### Known Issues

- `task:update` 未更新 `due_date` 和 `remind_at`。已在 Phase 1/2 交付版修复。
- 没有拖拽功能。
- 没有键盘快捷键。
- 右键菜单可能跑出屏幕。已在 Phase 1/2 交付版修复。
