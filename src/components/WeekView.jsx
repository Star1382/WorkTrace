import React, { useEffect, useMemo, useState } from 'react';
import { taskService } from '../services/taskService';
import * as domain from '../shared/domain.js';
import { formatDate, getWeekDays } from '../shared/date.js';

const { TASK_STATUS_LABELS } = domain;

function WeekView({ date, refreshKey, onDateQuickAdd }) {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const days = useMemo(() => getWeekDays(date), [date]);

  useEffect(() => {
    const loadTasks = async () => {
      const result = await taskService.getByWeek({ date });
      if (result.success) {
        setTasks(result.data);
        setMessage('');
      } else {
        setMessage(result.error || '本周任务加载失败');
      }
    };

    loadTasks();
  }, [date, refreshKey]);

  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const key = task.due_date;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {});
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">本周视图</h2>
        <p className="text-sm text-gray-500 mt-1">7天概览，每天显示任务数和标题预览。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
        {days.map((day) => {
          const dateValue = formatDate(day);
          const dayTasks = tasksByDate[dateValue] || [];
          const previewTasks = dayTasks.slice(0, 4);

          return (
            <button
              key={dateValue}
              type="button"
              onClick={() => onDateQuickAdd(dateValue)}
              className="bg-white border border-gray-200 rounded-lg p-3 min-h-[180px] text-left hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {day.toLocaleDateString('zh-CN', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-gray-500">{dateValue.slice(5)}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{dayTasks.length}项</span>
              </div>

              <div className="mt-3 space-y-2">
                {previewTasks.length > 0 ? previewTasks.map((task) => (
                  <div key={task.id} className="rounded-md bg-gray-50 px-2 py-1.5">
                    <div className="text-xs font-medium text-gray-800 truncate">{task.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{TASK_STATUS_LABELS[task.status] || task.status}</div>
                  </div>
                )) : (
                  <div className="text-xs text-gray-400">暂无任务</div>
                )}
                {dayTasks.length > previewTasks.length && (
                  <div className="text-xs font-medium text-gray-500">+{dayTasks.length - previewTasks.length}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {message && <div className="text-sm text-red-600">{message}</div>}
    </div>
  );
}

export default WeekView;
