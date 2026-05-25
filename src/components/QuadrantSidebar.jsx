import React, { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import * as domain from '../shared/domain.js';
import { formatShortDate } from '../shared/date.js';

const { QUADRANT_LABELS, BOARD_QUADRANTS } = domain;

const quadrantPreviewStyles = {
  1: {
    dot: 'bg-red-500',
    border: 'border-red-200 hover:border-red-300 hover:bg-red-50',
    badge: 'bg-red-100 text-red-700',
  },
  2: {
    dot: 'bg-amber-500',
    border: 'border-amber-200 hover:border-amber-300 hover:bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
  },
  3: {
    dot: 'bg-blue-500',
    border: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  4: {
    dot: 'bg-green-500',
    border: 'border-green-200 hover:border-green-300 hover:bg-green-50',
    badge: 'bg-green-100 text-green-700',
  },
};

function groupQuadrantPreview(tasks) {
  return BOARD_QUADRANTS.reduce((acc, quadrant) => {
    const quadrantTasks = tasks.filter((task) => Number(task.quadrant) === quadrant.id);
    acc[quadrant.id] = {
      total: quadrantTasks.length,
      previewTasks: quadrantTasks.slice(0, 3),
    };
    return acc;
  }, {});
}

function QuadrantSidebar({ refreshKey, openModule }) {
  const [summary, setSummary] = useState(groupQuadrantPreview([]));

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      const result = await taskService.getByQuadrant({ onlyAssigned: true });
      if (!cancelled && result.success) {
        setSummary(groupQuadrantPreview(result.data));
      }
    }

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const openQuadrant = (quadrantId = null) => {
    openModule('board', { selectedQuadrantId: quadrantId });
  };

  return (
    <div className="mt-6 flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-600">四象限事项</h3>
        <button
          type="button"
          onClick={() => openQuadrant(null)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          全部
        </button>
      </div>
      <div className="space-y-3">
        {BOARD_QUADRANTS.map((quadrant) => {
          const style = quadrantPreviewStyles[quadrant.id];
          const item = summary[quadrant.id] || { total: 0, previewTasks: [] };
          const hiddenTaskCount = Math.max(item.total - item.previewTasks.length, 0);

          return (
            <button
              key={quadrant.id}
              type="button"
              onClick={() => openQuadrant(quadrant.id)}
              className={`w-full text-left rounded-lg border bg-white p-3 transition-colors ${style.border}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center min-w-0">
                  <span className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${style.dot}`}></span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {QUADRANT_LABELS[quadrant.id]}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{quadrant.description}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${style.badge}`}>
                  {item.total}项
                </span>
              </div>

              <div className="mt-2 space-y-1">
                {item.previewTasks.length > 0 ? (
                  item.previewTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-2 text-xs text-gray-600"
                    >
                      <span className="truncate">{task.title}</span>
                      <span className="text-gray-400 flex-shrink-0">
                        {formatShortDate(task.due_date, '无日期')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400">暂无事项</div>
                )}
                {hiddenTaskCount > 0 && (
                  <div className="text-xs font-medium text-gray-500">+{hiddenTaskCount}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuadrantSidebar;
