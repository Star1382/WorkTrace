const { TASK_STATUS, ACTIVE_STATUSES } = require('../../shared/domain.cjs');
const { getWeekRange, getMonthRange } = require('../../shared/date.cjs');

const TASK_COLUMNS = 'id, title, description, quadrant, status, due_date, remind_at, created_at, updated_at, completed_at';

function createTaskRepository(db) {
  return {
    init() {
      db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          quadrant INTEGER DEFAULT 0,
          status TEXT DEFAULT 'todo',
          due_date DATE,
          remind_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME
        )
      `);
    },

    getByDate(date) {
      return db.prepare(`SELECT ${TASK_COLUMNS} FROM tasks WHERE due_date = ? ORDER BY created_at ASC`).all(date);
    },

    getInRange(start, end) {
      return db.prepare(`
        SELECT ${TASK_COLUMNS}
        FROM tasks
        WHERE due_date >= ? AND due_date <= ?
        ORDER BY due_date ASC, created_at ASC
      `).all(start, end);
    },

    getByWeek(params = {}) {
      const range = params.start && params.end
        ? { startValue: params.start, endValue: params.end }
        : getWeekRange(params.date);
      return {
        range: { start: range.startValue, end: range.endValue },
        tasks: this.getInRange(range.startValue, range.endValue)
      };
    },

    getByMonth(params = {}) {
      const range = params.start && params.end
        ? { startValue: params.start, endValue: params.end }
        : getMonthRange(params.date);
      return {
        range: { start: range.startValue, end: range.endValue },
        tasks: this.getInRange(range.startValue, range.endValue)
      };
    },

    getByQuadrant(params = {}) {
      const excludeDone = params.excludeDone === true;
      const onlyAssigned = params.onlyAssigned !== false;
      const quadrant = Number(params.quadrant);
      const hasQuadrant = Number.isInteger(quadrant) && quadrant >= 1 && quadrant <= 4;
      const where = [
        excludeDone ? 'status != @doneStatus' : null,
        hasQuadrant ? 'quadrant = @quadrant' : null,
        onlyAssigned ? 'quadrant BETWEEN 1 AND 4' : null
      ].filter(Boolean);
      const bindings = {};
      if (excludeDone) {
        bindings.doneStatus = TASK_STATUS.DONE;
      }
      if (hasQuadrant) {
        bindings.quadrant = quadrant;
      }
      const sql = `
        SELECT ${TASK_COLUMNS}
        FROM tasks
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY quadrant ASC, due_date ASC, created_at ASC
      `;
      const stmt = db.prepare(sql);
      return Object.keys(bindings).length > 0 ? stmt.all(bindings) : stmt.all();
    },

    countOpenByQuadrant() {
      const rows = db.prepare(`
        SELECT quadrant, COUNT(*) as count
        FROM tasks
        WHERE status != ? AND quadrant BETWEEN 1 AND 4
        GROUP BY quadrant
      `).all(TASK_STATUS.DONE);
      return rows.reduce((acc, row) => {
        acc[row.quadrant] = row.count;
        return acc;
      }, { 1: 0, 2: 0, 3: 0, 4: 0 });
    },

    countByRange(start, end) {
      const total = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE due_date BETWEEN ? AND ?').get(start, end);
      const done = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE due_date BETWEEN ? AND ? AND status = ?')
        .get(start, end, TASK_STATUS.DONE);
      return { total: total.count, done: done.count };
    },

    add(task) {
      const result = db.prepare(`
        INSERT INTO tasks (title, description, quadrant, status, due_date, remind_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        task.title,
        task.description || '',
        task.quadrant || 0,
        task.status || TASK_STATUS.TODO,
        task.due_date,
        task.remind_at || null
      );
      return { id: result.lastInsertRowid };
    },

    quickAdd(task) {
      return this.add({
        title: task.title,
        description: '',
        quadrant: task.quadrant || 0,
        status: TASK_STATUS.TODO,
        due_date: task.due_date,
        remind_at: null
      });
    },

    update(task) {
      db.prepare(`
        UPDATE tasks
        SET title = ?, description = ?, quadrant = ?, status = ?, due_date = ?, remind_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        task.title,
        task.description || '',
        task.quadrant,
        task.status,
        task.due_date || null,
        task.remind_at || null,
        task.id
      );
    },

    toggleStatus(taskId, newStatus) {
      if (newStatus === TASK_STATUS.DONE) {
        db.prepare(`
          UPDATE tasks
          SET status = ?, completed_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ?
        `).run(newStatus, taskId);
        return;
      }
      db.prepare(`
        UPDATE tasks
        SET status = ?, completed_at = NULL, updated_at = datetime('now')
        WHERE id = ?
      `).run(newStatus, taskId);
    },

    delete(taskId) {
      db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
    },

    getDueReminderCandidates() {
      return db.prepare(`
        SELECT ${TASK_COLUMNS}
        FROM tasks
        WHERE remind_at IS NOT NULL
          AND remind_at != ''
          AND status IN (${ACTIVE_STATUSES.map(() => '?').join(', ')})
        ORDER BY remind_at ASC
      `).all(...ACTIVE_STATUSES);
    },

    setReminder(taskId, remindAt) {
      db.prepare(`
        UPDATE tasks
        SET remind_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(remindAt, taskId);
    }
  };
}

module.exports = { createTaskRepository };
