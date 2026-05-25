import React, { useEffect, useRef, useState } from 'react';
import QuickAddInput from './QuickAddInput';
import TaskItem from './TaskItem';
import ContextMenu from './ContextMenu';
import WelcomeGuide from './WelcomeGuide';

const MENU_WIDTH = 176;
const MENU_HEIGHT = 216;

/**
 * 任务列表 —— 组合 QuickAddInput / TaskItem / ContextMenu
 * 只管理 contextMenu 状态和 taskRefs，不包含子组件的渲染细节
 * isEmpty / onCreateSamples 用于首次使用引导
 */
function TaskList({
  tasks,
  highlightedTaskId,
  selectedTaskId,
  quickAddDraft,
  quickEditTaskId,
  isEmpty,
  isCreatingSamples,
  onSelectTask,
  onToggleStatus,
  onChangeStatus,
  onEdit,
  onDelete,
  onAdd,
  onQuickAdd,
  onCreateSamples,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const quickInputRef = useRef(null);
  const taskRefs = useRef({});

  const handleContextMenu = (e, task) => {
    e.preventDefault();
    let x = e.clientX;
    let y = e.clientY;

    if (x + MENU_WIDTH > window.innerWidth) {
      x = window.innerWidth - MENU_WIDTH - 8;
    }
    if (y + MENU_HEIGHT > window.innerHeight) {
      y = window.innerHeight - MENU_HEIGHT - 8;
    }

    setContextMenu({ x: Math.max(8, x), y: Math.max(8, y), task });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleStatusChange = (taskId, newStatus) => {
    onChangeStatus(taskId, newStatus);
    closeContextMenu();
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // 高亮任务自动滚动
  useEffect(() => {
    if (highlightedTaskId && taskRefs.current[highlightedTaskId]) {
      taskRefs.current[highlightedTaskId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedTaskId]);

  return (
    <div className="space-y-4">
      <QuickAddInput ref={quickInputRef} draft={quickAddDraft} onQuickAdd={onQuickAdd} />

      {isEmpty === true && tasks.length === 0 ? (
        <WelcomeGuide onDismiss={onCreateSamples} isCreating={isCreatingSamples} />
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">暂无任务</p>
          <p className="text-sm mt-2">点击下方按钮添加新任务</p>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            ref={(node) => {
              taskRefs.current[task.id] = node;
            }}
            task={task}
            selectedTaskId={selectedTaskId}
            highlightedTaskId={highlightedTaskId}
            quickEditTaskId={quickEditTaskId}
            onSelectTask={onSelectTask}
            onToggleStatus={onToggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
            onContextMenu={handleContextMenu}
          />
        ))
      )}

      <button
        onClick={onAdd}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + 添加任务
      </button>

      <ContextMenu
        menu={contextMenu}
        onChangeStatus={handleStatusChange}
        onDelete={onDelete}
        onClose={closeContextMenu}
      />
    </div>
  );
}

export default TaskList;
