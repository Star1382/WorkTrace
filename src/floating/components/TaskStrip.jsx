const QUADRANT_DOTS = {
  1: 'bg-red-500',
  2: 'bg-amber-400',
  3: 'bg-blue-500',
  4: 'bg-emerald-500'
};

function TaskStrip({ task, onToggle, onOpenMain }) {
  const isDone = task.status === 'done';
  const dotClass = QUADRANT_DOTS[task.quadrant] || 'bg-zinc-500';

  return (
    <div
      onDoubleClick={onOpenMain}
      className="group flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-white/95 transition hover:bg-white/10"
      title="双击打开主窗口"
    >
      <span
        role="checkbox"
        aria-checked={isDone}
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          onToggle(task);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            onToggle(task);
          }
        }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/35 text-xs text-white hover:border-white/80"
      >
        {isDone ? '✓' : ''}
      </span>
      <span className={`min-w-0 flex-1 truncate ${isDone ? 'text-white/45 line-through' : ''}`}>
        {task.title}
      </span>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
    </div>
  );
}

export default TaskStrip;
