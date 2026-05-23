import React, { useState, useEffect } from 'react';

function TaskModal({ task, defaultDueDate, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quadrant, setQuadrant] = useState(0);
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState(defaultDueDate || '');
  const [remindAt, setRemindAt] = useState('');

  const toDateTimeLocalValue = (value) => {
    if (!value) {
      return '';
    }
    return String(value).replace(' ', 'T').slice(0, 16);
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setQuadrant(task.quadrant || 0);
      setStatus(task.status || 'todo');
      setDueDate(task.due_date || defaultDueDate || '');
      setRemindAt(toDateTimeLocalValue(task.remind_at));
    } else {
      setTitle('');
      setDescription('');
      setQuadrant(0);
      setStatus('todo');
      setDueDate(defaultDueDate || '');
      setRemindAt('');
    }
  }, [task, defaultDueDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入任务标题');
      return;
    }
    onSave({
      title: title.trim(),
      description,
      quadrant,
      status,
      due_date: dueDate || null,
      remind_at: remindAt ? remindAt.replace('T', ' ') + ':00' : null
    });
  };

  const formatDateTimeLocal = (date) => {
    const pad = (value) => String(value).padStart(2, '0');
    return [
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      `${pad(date.getHours())}:${pad(date.getMinutes())}`
    ].join('T');
  };

  const setPresetReminder = (preset) => {
    const next = new Date();

    if (preset === 'hour') {
      next.setHours(next.getHours() + 1);
    }

    if (preset === 'tomorrow') {
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0);
    }

    if (preset === 'nextMonday') {
      const day = next.getDay();
      const daysUntilMonday = day === 0 ? 1 : 8 - day;
      next.setDate(next.getDate() + daysUntilMonday);
      next.setHours(9, 0, 0, 0);
    }

    setRemindAt(formatDateTimeLocal(next));
  };

  const quadrantOptions = [
    { value: 0, label: '未分类', color: 'bg-gray-100 text-gray-700' },
    { value: 1, label: '紧急重要', color: 'bg-red-100 text-red-700' },
    { value: 2, label: '紧急不重要', color: 'bg-amber-100 text-amber-700' },
    { value: 3, label: '重要不紧急', color: 'bg-blue-100 text-blue-700' },
    { value: 4, label: '不重要不紧急', color: 'bg-green-100 text-green-700' }
  ];

  const statusOptions = [
    { value: 'todo', label: '待办' },
    { value: 'in_progress', label: '进行中' },
    { value: 'done', label: '已完成' },
    { value: 'stuck', label: '阻塞' },
    { value: 'cancelled', label: '已取消' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">
            {task ? '编辑任务' : '添加任务'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入任务标题"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可选：添加任务说明或备注"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              四象限
            </label>
            <div className="grid grid-cols-5 gap-2">
              {quadrantOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setQuadrant(opt.value)}
                  className={`py-2 px-2 text-xs rounded-lg border transition-colors ${
                    quadrant === opt.value
                      ? opt.color + ' border-transparent font-medium'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                截止日期
              </label>
              <input
                type="date"
                value={dueDate || ''}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                提醒时间
              </label>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPresetReminder('hour')}
              className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              1小时后
            </button>
            <button
              type="button"
              onClick={() => setPresetReminder('tomorrow')}
              className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              明天9:00
            </button>
            <button
              type="button"
              onClick={() => setPresetReminder('nextMonday')}
              className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              下周一9:00
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {task ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
