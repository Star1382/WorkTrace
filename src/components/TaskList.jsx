import React, { useEffect, useRef, useState } from 'react';

function TaskList({
  tasks,
  highlightedTaskId,
  selectedTaskId,
  onSelectTask,
  onToggleStatus,
  onChangeStatus,
  onEdit,
  onDelete,
  onAdd
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const taskRefs = useRef({});

  const quadrantColors = {
    1: 'bg-red-500',
    2: 'bg-amber-500',
    3: 'bg-blue-500',
    4: 'bg-green-500',
    0: 'bg-gray-300'
  };

  const handleContextMenu = (e, task) => {
    e.preventDefault();
    const menuWidth = 176;
    const menuHeight = 216;
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 8;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 8;
    }

    setContextMenu({
      x: Math.max(8, x),
      y: Math.max(8, y),
      task
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleStatusChange = (taskId, newStatus) => {
    onChangeStatus(taskId, newStatus);
    closeContextMenu();
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (highlightedTaskId && taskRefs.current[highlightedTaskId]) {
      taskRefs.current[highlightedTaskId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedTaskId]);

  const getStatusLabel = (status) => {
    const labels = {
      todo: '待办',
      in_progress: '进行中',
      done: '已完成',
      stuck: '阻塞',
      cancelled: '已取消'
    };
    return labels[status] || status;
  };

  const getQuadrantLabel = (quadrant) => {
    const labels = { 0: '未分类', 1: '紧急重要', 2: '紧急不重要', 3: '重要不紧急', 4: '不重要不紧急' };
    return labels[quadrant] || '未分类';
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">暂无任务</p>
          <p className="text-sm mt-2">点击下方按钮添加新任务</p>
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            ref={(node) => { taskRefs.current[task.id] = node; }}
            onClick={() => onSelectTask(task.id)}
            className={`bg-white rounded-lg shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer ${
              task.status === 'done' ? 'opacity-70' : ''
            } ${
              selectedTaskId === task.id ? 'ring-2 ring-blue-300' : ''
            } ${
              highlightedTaskId === task.id ? 'ring-2 ring-amber-400 bg-amber-50' : ''
            }`}
            onContextMenu={(e) => handleContextMenu(e, task)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStatus(task.id, task.status); }}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                ${task.status === 'done' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-400'}`}
            >
              {task.status === 'done' && '✓'}
            </button>

            <div className={`w-1 h-12 rounded-full ${quadrantColors[task.quadrant] || 'bg-gray-300'}`}></div>

            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-gray-800 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  task.quadrant === 1 ? 'bg-red-100 text-red-700' :
                  task.quadrant === 2 ? 'bg-amber-100 text-amber-700' :
                  task.quadrant === 3 ? 'bg-blue-100 text-blue-700' :
                  task.quadrant === 4 ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getQuadrantLabel(task.quadrant)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  task.status === 'todo' ? 'bg-gray-100 text-gray-600' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                  task.status === 'done' ? 'bg-green-100 text-green-600' :
                  task.status === 'stuck' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getStatusLabel(task.status)}
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
        ))
      )}

      <button
        onClick={onAdd}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 添加任务
      </button>

      {contextMenu && (
        <div
          className="fixed w-44 bg-white rounded-lg shadow-lg border py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleStatusChange(contextMenu.task.id, 'todo')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${contextMenu.task.status === 'todo' ? 'bg-blue-50' : ''}`}
          >
            设为待办
          </button>
          <button
            onClick={() => handleStatusChange(contextMenu.task.id, 'in_progress')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${contextMenu.task.status === 'in_progress' ? 'bg-blue-50' : ''}`}
          >
            设为进行中
          </button>
          <button
            onClick={() => handleStatusChange(contextMenu.task.id, 'done')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${contextMenu.task.status === 'done' ? 'bg-blue-50' : ''}`}
          >
            设为已完成
          </button>
          <button
            onClick={() => handleStatusChange(contextMenu.task.id, 'stuck')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${contextMenu.task.status === 'stuck' ? 'bg-blue-50' : ''}`}
          >
            设为阻塞
          </button>
          <div className="border-t my-1"></div>
          <button
            onClick={() => { onDelete(contextMenu.task.id); closeContextMenu(); }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            删除任务
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskList;
