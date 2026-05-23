const fs = require('fs');
const { clipboard, dialog } = require('electron');

const STATUS_ORDER = ['done', 'in_progress', 'todo', 'stuck', 'cancelled'];
const STATUS_LABELS = {
  done: '已完成',
  in_progress: '进行中',
  todo: '待办',
  stuck: '阻塞',
  cancelled: '已取消'
};
const STATUS_SYMBOLS = {
  done: '✓',
  in_progress: '◐',
  todo: '☐',
  stuck: '⚠',
  cancelled: '✗'
};
const QUADRANT_LABELS = {
  0: '未分类',
  1: '紧急重要',
  2: '紧急不重要',
  3: '重要不紧急',
  4: '不重要不紧急'
};

function pad(value) {
  return String(value).padStart(2, '0');
}

function parseDate(value) {
  if (!value) {
    return new Date();
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  return new Date(value);
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatShortDate(value) {
  if (!value) {
    return '';
  }
  const date = parseDate(value);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function formatPeriodDate(value) {
  const date = parseDate(value);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function getWeekRange(value) {
  const date = parseDate(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function getMonthRange(value) {
  const date = parseDate(value);
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
  };
}

function getTasksInRange(db, start, end) {
  return db.prepare(`
    SELECT id, title, description, quadrant, status, due_date, remind_at, created_at, updated_at, completed_at
    FROM tasks
    WHERE due_date BETWEEN ? AND ?
    ORDER BY due_date ASC, created_at ASC
  `).all(formatDate(start), formatDate(end));
}

function countByStatus(tasks) {
  return STATUS_ORDER.reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status).length;
    return acc;
  }, {});
}

function countByQuadrant(tasks) {
  const result = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  tasks.forEach(task => {
    const key = Number(task.quadrant) || 0;
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      result[key] += 1;
    }
  });
  return result;
}

function buildBaseReport(tasks, start, end) {
  const statusCounts = countByStatus(tasks);
  return {
    period: `${formatDate(start)} ~ ${formatDate(end)}`,
    total: tasks.length,
    ...statusCounts,
    quadrant_breakdown: countByQuadrant(tasks),
    tasks
  };
}

function buildWeeklyReport(db, date) {
  const { start, end } = getWeekRange(date);
  return buildBaseReport(getTasksInRange(db, start, end), start, end);
}

function buildMonthlyTrend(tasks, start, end) {
  const trend = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const weekEnd = new Date(cursor);
    weekEnd.setDate(cursor.getDate() + (7 - (cursor.getDay() || 7)));
    if (weekEnd > end) {
      weekEnd.setTime(end.getTime());
    }

    const chunkStart = formatDate(cursor);
    const chunkEnd = formatDate(weekEnd);
    const weekTasks = tasks.filter(task => task.due_date >= chunkStart && task.due_date <= chunkEnd);
    trend.push({
      week: `${cursor.getMonth() + 1}.${cursor.getDate()}-${weekEnd.getMonth() + 1}.${weekEnd.getDate()}`,
      total: weekTasks.length,
      done: weekTasks.filter(task => task.status === 'done').length
    });

    cursor.setDate(weekEnd.getDate() + 1);
  }

  return trend;
}

function buildMonthlyReport(db, date) {
  const { start, end } = getMonthRange(date);
  const tasks = getTasksInRange(db, start, end);
  return {
    ...buildBaseReport(tasks, start, end),
    weekly_trend: buildMonthlyTrend(tasks, start, end)
  };
}

function getReport(type, db, date) {
  return type === 'monthly' ? buildMonthlyReport(db, date) : buildWeeklyReport(db, date);
}

function getQuadrantSections(tasks) {
  return [1, 2, 3, 4, 0]
    .map(quadrant => ({
      quadrant,
      title: QUADRANT_LABELS[quadrant],
      tasks: tasks.filter(task => Number(task.quadrant) === quadrant)
    }))
    .filter(section => section.tasks.length > 0);
}

function renderTaskLine(task) {
  const symbol = STATUS_SYMBOLS[task.status] || '☐';
  const dateText = formatShortDate(task.due_date);
  const statusText = task.status && task.status !== 'done' && task.status !== 'todo'
    ? `（${STATUS_LABELS[task.status] || task.status}）`
    : '';
  return `${symbol} ${task.title}${dateText ? ` ${dateText}` : ''}${statusText}`;
}

function renderReportText(type, report) {
  const isMonthly = type === 'monthly';
  const done = report.done || 0;
  const total = report.total || 0;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;
  const [start, end] = report.period.split(' ~ ');
  const lines = [
    `【${isMonthly ? '本月' : '本周'}工作汇报】${formatPeriodDate(start)}-${formatShortDate(end)}`,
    `完成率：${done}/${total} (${rate}%)`,
    ''
  ];

  if (isMonthly && report.weekly_trend?.length) {
    lines.push('周度趋势：');
    report.weekly_trend.forEach(item => {
      lines.push(`${item.week}：${item.done}/${item.total}`);
    });
    lines.push('');
  }

  getQuadrantSections(report.tasks).forEach((section, index) => {
    lines.push(`${['一', '二', '三', '四', '五'][index]}、${section.title}（${section.tasks.length}项）`);
    section.tasks.forEach(task => lines.push(renderTaskLine(task)));
    lines.push('');
  });

  const pending = report.tasks.filter(task => ['todo', 'in_progress', 'stuck'].includes(task.status));
  if (pending.length) {
    lines.push('待推进事项：');
    pending.forEach(task => lines.push(renderTaskLine(task)));
  }

  return lines.join('\n').trim();
}

module.exports = {
  name: 'report',

  registerHandlers(ipcMain, db) {
    ipcMain.handle('report:weekly', async (event, params = {}) => {
      try {
        return { success: true, data: buildWeeklyReport(db, params.date) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('report:monthly', async (event, params = {}) => {
      try {
        return { success: true, data: buildMonthlyReport(db, params.date) };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('report:exportText', async (event, params = {}) => {
      try {
        const type = params.type === 'monthly' ? 'monthly' : 'weekly';
        const report = getReport(type, db, params.date);
        const filename = `${type === 'monthly' ? '月报' : '周报'}_${report.period.replace(' ~ ', '_')}.txt`;
        return {
          success: true,
          data: {
            text: renderReportText(type, report),
            filename
          }
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('report:copyToClipboard', async (event, params = {}) => {
      try {
        clipboard.writeText(params.text || '');
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('report:saveToFile', async (event, params = {}) => {
      try {
        const result = await dialog.showSaveDialog({
          defaultPath: params.defaultPath || params.filename || 'worktrace-report.txt',
          filters: [{ name: 'Text', extensions: ['txt'] }]
        });

        if (result.canceled || !result.filePath) {
          return { success: true, data: { path: null, canceled: true } };
        }

        fs.writeFileSync(result.filePath, params.text || '', 'utf8');
        return { success: true, data: { path: result.filePath, canceled: false } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
};
