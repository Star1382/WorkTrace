import React from 'react';
import * as domain from '../shared/domain.js';

const { TASK_STATUS, TASK_STATUS_LABELS, QUADRANT_LABELS } = domain;

const QUADRANT_COLORS = {
  1: 'bg-red-500',
  2: 'bg-amber-500',
  3: 'bg-blue-500',
  4: 'bg-green-500',
  0: 'bg-gray-300'
};

const QUADRANT_BADGE = {
  1: 'bg-red-100 text-red-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-blue-100 text-blue-700',
  4: 'bg-green-100 text-green-700',
  0: 'bg-gray-100 text-gray-600'
};

const STATUS_BADGE = {
  [TASK_STATUS.TODO]: 'bg-gray-100 text-gray-600',
  [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-600',
  [TASK_STATUS.DONE]: 'bg-green-100 text-green-600',
  [TASK_STATUS.STUCK]: 'bg-red-100 text-red-600'
};

/**
 * 单条任务行
 * 使用 React.memo 避免其他任务变化时不必要的重渲染
 */
const TaskItem = React.memo(React.forwardRef(function TaskItem({
  task,
  selectedTaskId,
  highlightedTaskId,
  quickEditTaskId,
  onSelectTask,
  onToggleStatus,
  onEdit,
  onDelete,
  onContextMenu
}, ref) {
  const isDone = task.status === TASK_STATUS.DONE;
  const isSelected = selectedTaskId === task.id;
  const isHighlighted = highlightedTaskId === task.id;

  const handleClick = () => {
    onSelectTask(task.id);
    if (task.id === quickEditTaskId) {
      onEdit(task);
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`bg-white rounded-lg shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer ${
        isDone ? 'opacity-70' : ''
      } ${
        isSelected ? 'ring-2 ring-blue-300' : ''
      } ${
        isHighlighted ? 'ring-2 ring-amber-400 bg-amber-50' : ''
      }`}
      onContextMenu={(e) => onContextMenu(e, task)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleStatus(task.id, task.status); }}
        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
          isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        {isDone && '✓'}
      </button>

      <div className={`w-1 h-12 rounded-full ${QUADRANT_COLORS[task.quadrant] || 'bg-gray-300'}`}></div>

      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-gray-800 ${isDone ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded ${QUADRANT_BADGE[task.quadrant] || QUADRANT_BADGE[0]}`}>
            {QUADRANT_LABELS[task.quadrant] || QUADRANT_LABELS[0]}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${STATUS_BADGE[task.status] || 'bg-gray-100 text-gray-600'}`}>
            {TASK_STATUS_LABELS[task.status] || task.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          className="p-1 text-gray-400 hover:text-blue-500"
          title="编辑"
        >
          ✏️
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-1 text-gray-400 hover:text-red-500"
          title="删除"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}));

export default TaskItem;
