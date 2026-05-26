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
      if (channel === 'task:quickAdd') {
        return { success: true, data: { id: 0 } };
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
  const inputRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [weekStats, setWeekStats] = useState({ total: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPinned, setIsPinned] = useState(true);
  const [isDimmed, setIsDimmed] = useState(false);
  const [quickText, setQuickText] = useState('');
  const [quickMsg, setQuickMsg] = useState('');

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

  async function handleQuickAdd(e) {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
    e.preventDefault();
    const text = quickText.trim();
    if (!text) return;

    setQuickMsg('');
    const result = await api.invoke('task:quickAdd', { text });
    if (result?.success) {
      setQuickText('');
      await refresh();
    } else {
      setQuickMsg(result?.error || '创建失败');
    }
  }

  return (
    <div
      className={`h-full w-full overflow-hidden rounded-2xl transition-opacity duration-300 ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
      onMouseEnter={restoreOpacity}
      onMouseLeave={scheduleDim}
      style={{ background: 'transparent' }}
    >
      <div className="flex h-full max-h-[600px] min-h-[200px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)]" style={{ background: 'rgba(20,20,25,0.40)', backdropFilter: 'blur(20px)' }}>
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 [-webkit-app-region:drag]">
          <span className="text-base leading-none text-white/60">≡</span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/80">WorkTrace</span>
          <button
            type="button"
            onClick={handleTogglePin}
            className={`rounded p-1 text-sm transition hover:bg-white/[0.06] [-webkit-app-region:no-drag] ${isPinned ? 'text-amber-400' : 'text-white/40'}`}
            title="切换置顶"
          >
            📌
          </button>
          <button
            type="button"
            onClick={api.hide}
            className="rounded p-1 text-sm text-white/40 transition hover:bg-white/[0.06] hover:text-white/80 [-webkit-app-region:no-drag]"
            title="隐藏"
          >
            ✕
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {loading && <div className="px-2 py-8 text-center text-sm text-white/35">加载中...</div>}
          {!loading && error && (
            <div className="rounded-md bg-red-500/10 px-2 py-2 text-xs text-red-300">{error}</div>
          )}
          {!loading && !error && tasks.length === 0 && (
            <div className="px-2 py-8 text-center text-sm text-white/35">今天没有待办</div>
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

        <footer className="shrink-0 border-t border-white/[0.06] px-2 py-1 space-y-1">
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={quickText}
              onChange={(e) => {
                setQuickText(e.target.value);
                setQuickMsg('');
              }}
              onKeyDown={handleQuickAdd}
              placeholder="输入任务，回车创建..."
              className="flex-1 min-w-0 rounded bg-white/[0.06] px-2 py-1 text-xs text-white/85 placeholder-white/30 outline-none [-webkit-app-region:no-drag]"
            />
            <button
              type="button"
              onClick={showMainWindow}
              className="shrink-0 rounded px-1.5 py-1 text-xs text-white/40 transition hover:bg-white/[0.06] hover:text-white/80 [-webkit-app-region:no-drag]"
              title="打开主窗口"
            >
              ⛶
            </button>
          </div>
          {quickMsg && <div className="text-xs text-red-300 px-1">{quickMsg}</div>}
          <div className="flex justify-between text-xs text-white/35 px-1">
            <span>今日 {weekStats.done}/{weekStats.total}</span>
            <span>Enter 创建</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default FloatingApp;
