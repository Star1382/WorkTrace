import React, { useEffect, useMemo, useState } from 'react';
import { reportService } from '../services/reportService';
import * as domain from '../shared/domain.js';
import { formatShortDate } from '../shared/date.js';

const { TASK_STATUS, TASK_STATUS_LABELS, TASK_STATUS_SYMBOLS, PENDING_STATUSES, QUADRANT_LABELS } =
  domain;

const quadrantStyles = {
  0: 'border-gray-200 bg-gray-50',
  1: 'border-red-200 bg-red-50',
  2: 'border-amber-200 bg-amber-50',
  3: 'border-blue-200 bg-blue-50',
  4: 'border-green-200 bg-green-50',
};

function formatPeriod(period) {
  if (!period) {
    return '';
  }
  return period.replaceAll('-', '.').replace(' ~ ', '-');
}

function getSections(tasks) {
  return [1, 2, 3, 4, 0]
    .map((quadrant) => ({
      quadrant,
      title: QUADRANT_LABELS[quadrant],
      tasks: sortTasksForSection(tasks.filter((task) => Number(task.quadrant) === quadrant)),
    }))
    .filter((section) => section.tasks.length > 0);
}

function isClosedTask(task) {
  return !PENDING_STATUSES.includes(task.status);
}

function sortTasksForSection(tasks) {
  return [...tasks].sort((a, b) => Number(isClosedTask(a)) - Number(isClosedTask(b)));
}

function ProgressBar({ done, total }) {
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${rate}%` }} />
      </div>
      <span className="w-12 text-right text-sm font-medium text-gray-700">{rate}%</span>
    </div>
  );
}

function TaskLine({ task }) {
  const isDone = task.status === TASK_STATUS.DONE;
  const isMuted = isDone || task.status === TASK_STATUS.CANCELLED;
  return (
    <div
      className={`flex items-center gap-2 py-1 ${isDone ? 'text-xs text-gray-600' : 'text-sm font-semibold text-gray-900'} ${isMuted && !isDone ? 'text-gray-600' : ''}`}
    >
      <span className="w-5 text-center">{TASK_STATUS_SYMBOLS[task.status] || '☐'}</span>
      <span
        className={`flex-1 min-w-0 truncate ${isDone ? 'line-through decoration-gray-600' : ''}`}
      >
        {task.title}
      </span>
      {task.status !== TASK_STATUS.DONE && task.status !== TASK_STATUS.TODO && (
        <span className="text-xs text-gray-500">{TASK_STATUS_LABELS[task.status]}</span>
      )}
      <span className="text-xs text-gray-500">{formatShortDate(task.due_date)}</span>
    </div>
  );
}

function ReportPanel({ type, date, refreshKey }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const isMonthly = type === 'monthly';
  const title = isMonthly ? '本月汇报' : '本周汇报';

  useEffect(() => {
    let cancelled = false;
    async function loadReport() {
      setLoading(true);
      setMessage('');
      const result = isMonthly
        ? await reportService.monthly(date)
        : await reportService.weekly(date);

      if (!cancelled) {
        setReport(result.success ? result.data : null);
        setMessage(result.success ? '' : result.error || '报表加载失败');
        setLoading(false);
      }
    }

    loadReport();
    return () => {
      cancelled = true;
    };
  }, [date, isMonthly, refreshKey]);

  const sections = useMemo(() => getSections(report?.tasks || []), [report]);
  const pendingTasks = useMemo(
    () => (report?.tasks || []).filter((task) => PENDING_STATUSES.includes(task.status)),
    [report]
  );

  const handleCopy = async () => {
    const textResult = await reportService.exportText(type, date);
    if (!textResult.success) {
      setMessage(textResult.error || '生成文本失败');
      return;
    }

    const copyResult = await reportService.copyToClipboard(textResult.data.text);
    setMessage(copyResult.success ? '已复制到剪贴板' : copyResult.error || '复制失败');
  };

  const handleExport = async () => {
    const textResult = await reportService.exportText(type, date);
    if (!textResult.success) {
      setMessage(textResult.error || '生成文本失败');
      return;
    }

    const saveResult = await reportService.saveToFile(
      textResult.data.text,
      textResult.data.filename
    );
    if (saveResult.success && !saveResult.data?.canceled) {
      setMessage(`已导出：${saveResult.data.path}`);
    } else if (!saveResult.success) {
      setMessage(saveResult.error || '导出失败');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">报表生成中...</div>;
  }

  if (!report) {
    return <div className="text-sm text-red-600">{message || '报表加载失败'}</div>;
  }

  const done = report.done || 0;
  const total = report.total || 0;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{formatPeriod(report.period)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            📋 复制到剪贴板
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            💾 导出文件
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">完成率</span>
          <span className="text-sm font-medium text-gray-800">
            {done}/{total}
          </span>
        </div>
        <ProgressBar done={done} total={total} />
      </div>

      {isMonthly && report.weekly_trend?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">周度趋势</h3>
          <div className="space-y-3">
            {report.weekly_trend.map((item) => (
              <div
                key={item.week}
                className="grid grid-cols-[88px_1fr_52px] items-center gap-3 text-sm"
              >
                <span className="text-gray-600">{item.week}</span>
                <ProgressBar done={item.done} total={item.total} />
                <span className="text-right text-gray-700">
                  {item.done}/{item.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sections.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-400">
          当前周期暂无任务
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {sections.map((section) => (
            <section
              key={section.quadrant}
              className={`border rounded-lg p-4 ${quadrantStyles[section.quadrant] || quadrantStyles[0]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{section.title}</h3>
                <span className="text-xs text-gray-500">{section.tasks.length}项</span>
              </div>
              <div className="divide-y divide-white/70">
                {section.tasks.map((task) => (
                  <TaskLine key={task.id} task={task} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {pendingTasks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">待推进事项</h3>
          <div className="divide-y divide-gray-100">
            {pendingTasks.map((task) => (
              <TaskLine key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {message && <div className="text-sm text-gray-600">{message}</div>}
    </div>
  );
}

export default ReportPanel;
