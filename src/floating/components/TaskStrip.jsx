const QUADRANT_DOTS = {
  1: 'bg-red-400',
  2: 'bg-amber-400',
  3: 'bg-blue-400',
  4: 'bg-emerald-400',
};

function TaskStrip({ task, onToggle, onOpenMain }) {
  const isDone = task.status === 'done';
  const dotClass = QUADRANT_DOTS[task.quadrant] || 'bg-zinc-500';

  return (
    <div
      onDoubleClick={onOpenMain}
      className="group flex h-9 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-white/[0.06]"
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
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition ${
          isDone
            ? 'border-emerald-400/60 text-emerald-400'
            : 'border-white/25 text-transparent hover:border-white/60'
        }`}
      >
        {isDone ? '✓' : ''}
      </span>
      <span className={`min-w-0 flex-1 truncate ${isDone ? 'text-white/35 line-through' : 'text-white/85'}`}>
        {task.title}
      </span>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} aria-hidden="true" />
    </div>
  );
}

export default TaskStrip;
