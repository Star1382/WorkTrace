import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { taskService } from '../services/taskService';

const quadrants = [
  { id: 1, title: '紧急重要', description: '立刻推进', color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700' },
  { id: 2, title: '紧急不重要', description: '快速处理', color: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  { id: 3, title: '重要不紧急', description: '计划推进', color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  { id: 4, title: '不重要不紧急', description: '低优先级', color: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-700' }
];

const statusLabels = {
  todo: '待办',
  in_progress: '进行中',
  done: '已完成',
  stuck: '阻塞',
  cancelled: '已取消'
};

const statusStyles = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  stuck: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500'
};

function formatShortDate(value) {
  if (!value) {
    return '无日期';
  }

  const [, month, day] = String(value).match(/^\d{4}-(\d{2})-(\d{2})/) || [];
  return month && day ? `${Number(month)}.${Number(day)}` : value;
}

function BoardColumn({ quadrant, tasks, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `quadrant-${quadrant.id}`,
    data: { quadrant: quadrant.id }
  });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[260px] rounded-lg border p-4 transition-colors ${quadrant.color} ${
        isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{quadrant.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{quadrant.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${quadrant.badge}`}>{tasks.length}项</span>
      </div>
      <SortableContext items={tasks.map((task) => String(task.id))} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">{children}</div>
      </SortableContext>
    </section>
  );
}

function BoardCard({ task, onEdit, onToggleStatus }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: String(task.id),
    data: { task, quadrant: Number(task.quadrant) }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-white/80 rounded-lg p-3 shadow-sm transition-shadow ${
        isDragging ? 'opacity-60 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={() => onToggleStatus(task.id, task.status)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
            task.status === 'done'
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-400'
          }`}
          title="切换完成状态"
        >
          {task.status === 'done' && '✓'}
        </button>
        <button
          type="button"
          className="flex-1 min-w-0 text-left cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <div className="font-medium text-sm text-gray-900 truncate">{task.title}</div>
          {task.description && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</div>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-xs px-2 py-0.5 rounded ${statusStyles[task.status] || statusStyles.todo}`}>
            {statusLabels[task.status] || task.status}
          </span>
          <span className="text-xs text-gray-500">{formatShortDate(task.due_date)}</span>
        </div>
        <button
          onClick={() => onEdit(task)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          编辑
        </button>
      </div>
    </article>
  );
}

function QuadrantBoard({ refreshKey, onTaskMoved, onEditTask, onToggleStatus }) {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  const loadTasks = async () => {
    const result = await taskService.getByQuadrant({ excludeDone: true });
    if (result.success) {
      setTasks(result.data);
      setMessage('');
    } else {
      setMessage(result.error || '看板加载失败');
    }
  };

  useEffect(() => {
    loadTasks();
  }, [refreshKey]);

  const groupedTasks = useMemo(() => {
    return quadrants.reduce((acc, quadrant) => {
      acc[quadrant.id] = tasks.filter((task) => Number(task.quadrant) === quadrant.id);
      return acc;
    }, {});
  }, [tasks]);

  const uncategorized = useMemo(
    () => tasks.filter((task) => ![1, 2, 3, 4].includes(Number(task.quadrant))),
    [tasks]
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const task = active.data.current?.task;
    const targetQuadrant = over.data.current?.quadrant;

    if (!task || !targetQuadrant || Number(task.quadrant) === Number(targetQuadrant)) {
      return;
    }

    const nextTask = { ...task, quadrant: Number(targetQuadrant) };
    setTasks((current) => current.map((item) => item.id === task.id ? nextTask : item));

    const result = await taskService.update(nextTask);
    if (result.success) {
      setMessage(`已移动到${quadrants.find((item) => item.id === Number(targetQuadrant))?.title || '新象限'}`);
      onTaskMoved();
    } else {
      setMessage(result.error || '移动失败');
      loadTasks();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">四象限看板</h2>
          <p className="text-sm text-gray-500 mt-1">拖动任务卡片调整象限，已完成任务默认不显示。</p>
        </div>
        <button
          onClick={loadTasks}
          className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          刷新
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {quadrants.map((quadrant) => (
            <BoardColumn key={quadrant.id} quadrant={quadrant} tasks={groupedTasks[quadrant.id] || []}>
              {(groupedTasks[quadrant.id] || []).map((task) => (
                <BoardCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onToggleStatus={onToggleStatus}
                />
              ))}
              {(groupedTasks[quadrant.id] || []).length === 0 && (
                <div className="border border-dashed border-gray-300 rounded-lg py-8 text-center text-sm text-gray-400">
                  拖动任务到这里
                </div>
              )}
            </BoardColumn>
          ))}
        </div>
      </DndContext>

      {uncategorized.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">未分类任务</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uncategorized.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-sm text-gray-900">{task.title}</div>
                <div className="text-xs text-gray-500 mt-1">{statusLabels[task.status] || task.status} · {formatShortDate(task.due_date)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && <div className="text-sm text-gray-600">{message}</div>}
    </div>
  );
}

export default QuadrantBoard;
