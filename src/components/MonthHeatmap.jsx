import React, { useEffect, useMemo, useState } from 'react';
import { taskService } from '../services/taskService';
import { formatDate, getMonthCalendar } from '../shared/date.js';

function getHeatClass(count) {
  if (count >= 6) {
    return 'bg-red-100 border-red-200 text-red-800';
  }
  if (count >= 3) {
    return 'bg-amber-100 border-amber-200 text-amber-800';
  }
  if (count >= 1) {
    return 'bg-blue-50 border-blue-200 text-blue-800';
  }
  return 'bg-white border-gray-200 text-gray-500';
}

function MonthHeatmap({ date, refreshKey, onDateQuickAdd }) {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const calendar = useMemo(() => getMonthCalendar(date), [date]);

  useEffect(() => {
    const loadTasks = async () => {
      const result = await taskService.getByMonth({ date });
      if (result.success) {
        setTasks(result.data);
        setMessage('');
      } else {
        setMessage(result.error || '本月任务加载失败');
      }
    };

    loadTasks();
  }, [date, refreshKey]);

  const countsByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.due_date] = (acc[task.due_date] || 0) + 1;
      return acc;
    }, {});
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">本月视图</h2>
        <p className="text-sm text-gray-500 mt-1">{calendar.title}任务热力图，每天标注任务数。</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map((label) => (
            <div key={label} className="text-xs font-medium text-gray-500 text-center">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendar.days.map((day) => {
            const dateValue = formatDate(day);
            const count = countsByDate[dateValue] || 0;
            const inMonth = day.getMonth() === calendar.month;

            return (
              <button
                type="button"
                key={dateValue}
                onClick={() => onDateQuickAdd(dateValue)}
                className={`min-h-[82px] rounded-lg border p-2 text-left hover:ring-2 hover:ring-blue-200 transition-shadow ${getHeatClass(count)} ${inMonth ? '' : 'opacity-40'}`}
              >
                <div className="text-sm font-semibold">{day.getDate()}</div>
                <div className="text-xs mt-2">{count > 0 ? `${count}项任务` : '无任务'}</div>
              </button>
            );
          })}
        </div>
      </div>

      {message && <div className="text-sm text-red-600">{message}</div>}
    </div>
  );
}

export default MonthHeatmap;
