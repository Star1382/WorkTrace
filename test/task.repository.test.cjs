/**
 * task.repository 测试 —— 使用内存 SQLite
 * 覆盖：add → getByDate → toggleStatus → delete 完整流程
 */
const Database = require('better-sqlite3');
const { createTaskRepository } = require('../electron/repositories/task.repository.cjs');
const { TASK_STATUS } = require('../shared/domain.cjs');

let db;
let tasks;

beforeEach(() => {
  db = new Database(':memory:');
  tasks = createTaskRepository(db);
  tasks.init();
});

afterEach(() => {
  db.close();
});

test('add 添加任务后可通过 getByDate 查询', () => {
  const result = tasks.add({
    title: '测试任务',
    description: '测试描述',
    quadrant: 1,
    status: 'todo',
    due_date: '2026-05-26'
  });

  expect(result.id).toBeGreaterThan(0);

  const list = tasks.getByDate('2026-05-26');
  expect(list.length).toBe(1);
  expect(list[0].title).toBe('测试任务');
  expect(list[0].quadrant).toBe(1);
});

test('quickAdd 使用默认值创建任务', () => {
  const result = tasks.quickAdd({
    title: '快速任务',
    due_date: '2026-05-27',
    quadrant: 3
  });

  const list = tasks.getByDate('2026-05-27');
  expect(list.length).toBe(1);
  expect(list[0].status).toBe('todo');
  expect(list[0].description).toBe('');
});

test('toggleStatus 切换为 done 时写入 completed_at', () => {
  const { id } = tasks.add({
    title: '要完成的任务',
    due_date: '2026-05-26'
  });

  const completedTime = '2026-05-26 21:30:00';
  tasks.toggleStatus(id, TASK_STATUS.DONE, completedTime);

  const list = tasks.getByDate('2026-05-26');
  expect(list[0].status).toBe(TASK_STATUS.DONE);
  expect(list[0].completed_at).toBe(completedTime);
});

test('toggleStatus 从 done 切回 todo 时清空 completed_at', () => {
  const { id } = tasks.add({
    title: '先完成后撤销',
    due_date: '2026-05-26'
  });

  tasks.toggleStatus(id, TASK_STATUS.DONE, '2026-05-26 10:00:00');
  tasks.toggleStatus(id, TASK_STATUS.TODO, null);

  const list = tasks.getByDate('2026-05-26');
  expect(list[0].status).toBe(TASK_STATUS.TODO);
  expect(list[0].completed_at).toBeNull();
});

test('delete 删除后 getByDate 查询为空', () => {
  const { id } = tasks.add({
    title: '待删除任务',
    due_date: '2026-05-26'
  });

  tasks.delete(id);

  const list = tasks.getByDate('2026-05-26');
  expect(list.length).toBe(0);
});

test('countAll 返回总任务数', () => {
  tasks.add({ title: '任务1', due_date: '2026-05-26' });
  tasks.add({ title: '任务2', due_date: '2026-05-27' });
  tasks.add({ title: '任务3', due_date: '2026-05-28' });

  expect(tasks.countAll()).toBe(3);
});

test('getByWeek 按周范围查询', () => {
  tasks.add({ title: '周一任务', due_date: '2026-05-25' }); // 周一
  tasks.add({ title: '周三任务', due_date: '2026-05-27' }); // 周三
  tasks.add({ title: '下周任务', due_date: '2026-06-01' }); // 下周

  const result = tasks.getByWeek({ date: '2026-05-26' }); // 5.26 所在的周
  expect(result.tasks.length).toBeGreaterThanOrEqual(2);
});

test('countOpenByQuadrant 按象限统计未完成任务', () => {
  tasks.add({ title: '紧急重要', quadrant: 1, due_date: '2026-05-26' });
  tasks.add({ title: '重要不紧急', quadrant: 3, due_date: '2026-05-26' });

  // 先添加再标记完成
  const { id } = tasks.add({ title: '已完成', quadrant: 1, due_date: '2026-05-26' });
  tasks.toggleStatus(id, TASK_STATUS.DONE, '2026-05-26 10:00:00');

  const counts = tasks.countOpenByQuadrant();
  // 已完成的不计入，所以 quadrant 1 只有 1 个待完成任务
  expect(counts[1]).toBe(1);
  expect(counts[3]).toBe(1);
});
