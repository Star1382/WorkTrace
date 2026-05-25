import React from 'react';
import * as domain from '../shared/domain.js';

const { TASK_STATUS, TASK_STATUS_OPTIONS } = domain;

const CONTEXT_STATUSES = TASK_STATUS_OPTIONS.filter(
  (status) => status.value !== TASK_STATUS.CANCELLED
);

/**
 * 右键上下文菜单
 * 独立组件，避免菜单状态变化导致整个任务列表重渲染
 */
function ContextMenu({ menu, onChangeStatus, onDelete, onClose }) {
  if (!menu) return null;

  const { x, y, task } = menu;

  return (
    <div
      className="fixed w-44 bg-white rounded-lg shadow-lg border py-1 z-50"
      style={{ left: x, top: y }}
    >
      {CONTEXT_STATUSES.map((status) => (
        <button
          key={status.value}
          type="button"
          onClick={() => onChangeStatus(task.id, status.value)}
          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${task.status === status.value ? 'bg-blue-50' : ''}`}
        >
          设为{status.label}
        </button>
      ))}
      <div className="border-t my-1"></div>
      <button
        type="button"
        onClick={() => { onDelete(task.id); onClose(); }}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        删除任务
      </button>
    </div>
  );
}

export default React.memo(ContextMenu);
