import { useEffect, useMemo, useRef, useState } from 'react';
import TaskStrip from './components/TaskStrip';

const REFRESH_MS = 30000;
const FADE_DELAY_MS = 3000;

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFloatingApi() {
  if (window.floatingAPI) {
    return window.floatingAPI;
  }
  return {
    invoke: async (channel) => {
      if (channel === 'task:getByDate') {
        return { success: true, data: [] };
      }
      if (channel === 'stats:getWeek') {
        return { success: true, data: { total: 0, done: 0 } };
      }
      if (channel === 'task:toggleStatus' || channel === 'floating:resizeToContent') {
        return { success: true };
      }
      return { success: false, error: 'floatingAPI unavailable' };
    },
    hide: () => {},
    showMain: () => {},
    togglePin: async () => true,
  };
}

function FloatingApp() {
  const api = useMemo(getFloatingApi, []);
  const fadeTimerRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [weekStats, setWeekStats] = useState({ total: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPinned, setIsPinned] = useState(true);
  const [isDimmed, setIsDimmed] = useState(false);

  const today = useMemo(() => formatDate(new Date()), []);

  async function refresh() {
    try {
      const [taskResult, statsResult] = await Promise.all([
        api.invoke('task:getByDate', today),
        api.invoke('stats:getWeek'),
      ]);

      if (taskResult?.success) {
        setTasks(taskResult.data || []);
      } else {
        throw new Error(taskResult?.error || '任务加载失败');
      }

      if (statsResult?.success) {
        setWeekStats(statsResult.data || { total: 0, done: 0 });
      }

      setError('');
    } catch (err) {
      setError(err.message || '悬浮窗刷新失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) {
        window.clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      api.invoke('floating:resizeToContent')?.catch(() => {});
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [api, tasks.length, loading, error]);

  function scheduleDim() {
    if (fadeTimerRef.current) {
      window.clearTimeout(fadeTimerRef.current);
    }
    fadeTimerRef.current = window.setTimeout(() => setIsDimmed(true), FADE_DELAY_MS);
  }

  function restoreOpacity() {
    if (fadeTimerRef.current) {
      window.clearTimeout(fadeTimerRef.current);
    }
    setIsDimmed(false);
  }

  async function handleToggle(task) {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    const result = await api.invoke('task:toggleStatus', task.id, nextStatus);
    if (result?.success) {
      await refresh();
    } else {
      setError(result?.error || '状态切换失败');
    }
  }

  async function handleTogglePin() {
    const nextState = await api.togglePin();
    setIsPinned(Boolean(nextState));
  }

  function showMainWindow() {
    api.showMain();
  }

  return (
    <div
      className={`h-full w-full p-2 transition-opacity duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
      onMouseEnter={restoreOpacity}
      onMouseLeave={scheduleDim}
    >
      <div className="flex h-full max-h-[600px] min-h-[200px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[rgba(30,30,30,0.85)] text-white shadow-2xl backdrop-blur">
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-white/10 px-3 [-webkit-app-region:drag]">
          <span className="text-base leading-none text-white/70">≡</span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">WorkTrace</span>
          <button
            type="button"
            onClick={handleTogglePin}
            className={`rounded p-1 text-sm transition hover:bg-white/10 [-webkit-app-region:no-drag] ${isPinned ? 'text-amber-300' : 'text-white/45'}`}
            title="切换置顶"
          >
            📌
          </button>
          <button
            type="button"
            onClick={api.hide}
            className="rounded p-1 text-sm text-white/70 transition hover:bg-white/10 hover:text-white [-webkit-app-region:no-drag]"
            title="隐藏"
          >
            ✕
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {loading && <div className="px-2 py-8 text-center text-sm text-white/55">加载中...</div>}
          {!loading && error && (
            <div className="rounded-md bg-red-500/15 px-2 py-2 text-xs text-red-100">{error}</div>
          )}
          {!loading && !error && tasks.length === 0 && (
            <div className="px-2 py-8 text-center text-sm text-white/45">今天没有待办</div>
          )}
          {!loading && !error && tasks.length > 0 && (
            <div className="space-y-1">
              {tasks.map((task) => (
                <TaskStrip
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onOpenMain={showMainWindow}
                />
              ))}
            </div>
          )}
        </main>

        <footer className="flex h-10 shrink-0 items-center justify-between border-t border-white/10 px-3 text-xs text-white/65">
          <button
            type="button"
            onClick={showMainWindow}
            className="rounded px-2 py-1 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            + 添加
          </button>
          <span>
            今日 {weekStats.done}/{weekStats.total} 完成
          </span>
        </footer>
      </div>
    </div>
  );
}

export default FloatingApp;
