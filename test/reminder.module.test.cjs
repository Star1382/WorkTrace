/**
 * reminder.module 测试 —— 纯函数逻辑
 * 不依赖 Electron，只测 parseReminderTime 和 getDueReminderTasks
 */
const Database = require('better-sqlite3');
const { createTaskRepository } = require('../electron/repositories/task.repository.cjs');
const { parseReminderTime, getDueReminderTasks } = require('../electron/modules/reminder.module.cjs');
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

describe('parseReminderTime', () => {
  test('正确解析 "2026-05-26 09:00" 格式', () => {
    const result = parseReminderTime('2026-05-26 09:00');
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(4); // 5月 = index 4
    expect(result.getDate()).toBe(26);
    expect(result.getHours()).toBe(9);
  });

  test('正确解析 "2026-05-26T09:00" 格式', () => {
    const result = parseReminderTime('2026-05-26T09:00');
    expect(result).toBeInstanceOf(Date);
  });

  test('空字符串返回 null', () => {
    expect(parseReminderTime('')).toBeNull();
  });

  test('null/undefined 返回 null', () => {
    expect(parseReminderTime(null)).toBeNull();
    expect(parseReminderTime(undefined)).toBeNull();
  });

  test('无效日期字符串返回 null', () => {
    expect(parseReminderTime('not-a-date')).toBeNull();
  });
});

describe('getDueReminderTasks', () => {
  test('返回 remind_at 已到期的活跃任务', () => {
    const pastTime = new Date(Date.now() - 10 * 60 * 1000); // 10分钟前
    const pad = (n) => String(n).padStart(2, '0');
    const pastStr = `${pastTime.getFullYear()}-${pad(pastTime.getMonth() + 1)}-${pad(pastTime.getDate())} ${pad(pastTime.getHours())}:${pad(pastTime.getMinutes())}:00`;

    tasks.add({
      title: '已到期的提醒任务',
      due_date: '2026-05-26',
      remind_at: pastStr
    });

    const due = getDueReminderTasks(db);
    expect(due.length).toBe(1);
    expect(due[0].title).toBe('已到期的提醒任务');
  });

  test('不返回 remind_at 未到期的任务', () => {
    const futureTime = new Date(Date.now() + 60 * 60 * 1000); // 1小时后
    const pad = (n) => String(n).padStart(2, '0');
    const futureStr = `${futureTime.getFullYear()}-${pad(futureTime.getMonth() + 1)}-${pad(futureTime.getDate())} ${pad(futureTime.getHours())}:${pad(futureTime.getMinutes())}:00`;

    tasks.add({
      title: '未来的提醒任务',
      due_date: '2026-05-26',
      remind_at: futureStr
    });

    const due = getDueReminderTasks(db);
    // 未到期的不会被返回
    expect(due.filter(t => t.title === '未来的提醒任务').length).toBe(0);
  });

  test('不返回已完成的任务', () => {
    const pastTime = new Date(Date.now() - 10 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const pastStr = `${pastTime.getFullYear()}-${pad(pastTime.getMonth() + 1)}-${pad(pastTime.getDate())} ${pad(pastTime.getHours())}:${pad(pastTime.getMinutes())}:00`;

    const { id } = tasks.add({
      title: '已完成但有提醒的任务',
      due_date: '2026-05-26',
      remind_at: pastStr
    });
    tasks.toggleStatus(id, TASK_STATUS.DONE, '2026-05-26 10:00:00');

    const due = getDueReminderTasks(db);
    expect(due.filter(t => t.id === id).length).toBe(0);
  });
});
