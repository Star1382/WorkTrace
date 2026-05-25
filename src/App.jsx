import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar';
import TaskModal from './components/TaskModal';
import StatusBar from './components/StatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import ModuleErrorBoundary from './components/ModuleErrorBoundary';
import { ToastProvider } from './components/Toast';
import { taskService } from './services/taskService';
import { statsService } from './services/statsService';
import { defaultModuleKey, featureModules, sidebarWidgets } from './modules';
import * as domain from './shared/domain.js';
import { formatDate, parseLocalDate } from './shared/date.js';
import { sampleTasks } from '../shared/sampleTasks.js';

const { TASK_STATUS } = domain;

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState(defaultModuleKey);
  const [isEmpty, setIsEmpty] = useState(null); // null=加载中 true=数据库为空 false=有数据
  const [isCreatingSamples, setIsCreatingSamples] = useState(false);
  const [activeNavChildren, setActiveNavChildren] = useState({});
  const [openNavMenuKey, setOpenNavMenuKey] = useState(null);
  const [moduleParamsByKey, setModuleParamsByKey] = useState({});
  const [tasks, setTasks] = useState([]);
  const [weekStats, setWeekStats] = useState({ total: 0, done: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [quickAddDraft, setQuickAddDraft] = useState(null);
  const [quickEditTaskId, setQuickEditTaskId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedDateValue = formatDate(selectedDate);

  const loadTasks = useCallback(async () => {
    const result = await taskService.getByDate(formatDate(selectedDate));
    if (result.success) {
      setTasks(result.data);
    }
  }, [selectedDate]);

  const loadStats = useCallback(async () => {
    const weekResult = await statsService.getWeek();
    if (weekResult.success) {
      setWeekStats(weekResult.data);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [loadTasks, loadStats]);

  // 首次启动检测：数据库是否为空
  useEffect(() => {
    let cancelled = false;
    taskService
      .countAll()
      .then((result) => {
        if (!cancelled && result.success) {
          setIsEmpty(result.data === 0);
        }
      })
      .catch(() => {
        if (!cancelled) setIsEmpty(false); // 出错时假设有数据，避免永远显示引导
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [tasks, selectedTaskId]);

  // 创建示例任务
  const handleCreateSamples = async () => {
    setIsCreatingSamples(true);
    const todayValue = formatDate(new Date());
    const samples = sampleTasks(todayValue);
    let hasError = false;
    for (const task of samples) {
      const result = await taskService.add(task);
      if (!result.success) {
        hasError = true;
      }
    }
    setIsCreatingSamples(false);
    if (!hasError) {
      setIsEmpty(false);
      refreshAll();
    }
  };

  const setModuleParams = (moduleKey, params) => {
    setModuleParamsByKey((current) => ({
      ...current,
      [moduleKey]: {
        ...(current[moduleKey] || {}),
        ...(typeof params === 'function' ? params(current[moduleKey] || {}) : params),
      },
    }));
  };

  const openModule = (moduleKey, params = {}) => {
    setOpenNavMenuKey(null);
    setActiveView(moduleKey);
    setModuleParamsByKey((current) => ({
      ...current,
      [moduleKey]: params,
    }));
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSelectDate = useCallback((date) => {
    setSelectedDate(parseLocalDate(date));
  }, []);

  const refreshAll = () => {
    loadTasks();
    loadStats();
    setRefreshKey((key) => key + 1);
  };

  const buildDatePrefix = (dateValue) => {
    const date = parseLocalDate(dateValue);
    return `${date.getMonth() + 1}月${date.getDate()}日 `;
  };

  const prepareQuickAddForDate = (dateValue) => {
    setSelectedDate(parseLocalDate(dateValue));
    setQuickAddDraft({ text: buildDatePrefix(dateValue), token: Date.now() });
    openModule('today');
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await taskService.update({ ...taskData, id: editingTask.id });
    } else {
      await taskService.add({ ...taskData, due_date: taskData.due_date || selectedDateValue });
    }
    setShowModal(false);
    refreshAll();
  };

  const handleQuickAdd = async (text) => {
    const result = await taskService.quickAdd(text, selectedDateValue);
    if (result.success) {
      setQuickEditTaskId(result.data?.id || null);
      refreshAll();
    }
    return result;
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === TASK_STATUS.DONE ? TASK_STATUS.TODO : TASK_STATUS.DONE;
    await taskService.toggleStatus(taskId, newStatus);
    refreshAll();
  };

  const handleChangeStatus = async (taskId, newStatus) => {
    await taskService.toggleStatus(taskId, newStatus);
    refreshAll();
  };

  const handleDeleteTask = async (taskId) => {
    await taskService.delete(taskId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    refreshAll();
  };

  const selectedDateText = selectedDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const handleTabClick = (module) => {
    if (module.navChildren?.length) {
      setOpenNavMenuKey((key) => (key === module.key ? null : module.key));
      return;
    }
    if (module.key === 'today') {
      setSelectedDate(parseLocalDate(new Date()));
    }
    openModule(module.key, {});
  };

  const handleNavChildClick = (module, child) => {
    setActiveNavChildren((current) => ({ ...current, [module.key]: child.key }));
    openModule(module.key, {});
  };

  useEffect(() => {
    if (!window.electronAPI?.reminder?.onFocusTask) {
      return undefined;
    }

    return window.electronAPI.reminder.onFocusTask((task) => {
      if (task?.due_date) {
        setSelectedDate(parseLocalDate(task.due_date));
      }
      openModule('today');
      setSelectedTaskId(task.id);
      setHighlightedTaskId(task.id);
      setRefreshKey((key) => key + 1);
      window.setTimeout(() => setHighlightedTaskId(null), 8000);
    });
  }, []);

  const tabs = featureModules.map(({ key, label }) => ({ key, label }));

  useEffect(() => {
    const isTypingTarget = (target) => {
      const tagName = target?.tagName?.toLowerCase();
      return ['input', 'textarea', 'select'].includes(tagName) || target?.isContentEditable;
    };

    const handleKeyDown = (event) => {
      if (event.ctrlKey && !event.shiftKey && !event.altKey) {
        const index = ['1', '2', '3', '4'].indexOf(event.key);
        if (index >= 0 && tabs[index]) {
          event.preventDefault();
          openModule(tabs[index].key);
          return;
        }

        if (event.key.toLowerCase() === 'n') {
          event.preventDefault();
          handleAddTask();
          return;
        }
      }

      if (event.key === 'Escape') {
        if (showModal) {
          event.preventDefault();
          setShowModal(false);
        } else {
          setOpenNavMenuKey(null);
        }
        return;
      }

      if (showModal || isTypingTarget(event.target)) {
        return;
      }

      const selectedTask = tasks.find((task) => task.id === selectedTaskId);
      if (!selectedTask) {
        return;
      }

      if (event.key === 'Delete') {
        event.preventDefault();
        handleDeleteTask(selectedTask.id);
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        handleEditTask(selectedTask);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, selectedTaskId, tasks, tabs]);

  const activeModule =
    featureModules.find((module) => module.key === activeView) || featureModules[0];
  const activeNavChildKey = activeNavChildren[activeModule.key] || activeModule.defaultNavChildKey;
  const moduleContext = {
    tasks,
    highlightedTaskId,
    selectedTaskId,
    selectedDate,
    selectedDateValue,
    refreshKey,
    quickAddDraft,
    quickEditTaskId,
    moduleParams: moduleParamsByKey[activeModule.key] || {},
    activeNavChildKey,
    isEmpty,
    isCreatingSamples,
    openModule,
    setModuleParams,
    setSelectedDate,
    setSelectedTaskId,
    handleAddTask,
    handleEditTask,
    handleSaveTask,
    handleQuickAdd,
    handleCreateSamples,
    prepareQuickAddForDate,
    handleToggleStatus,
    handleChangeStatus,
    handleDeleteTask,
    refreshAll,
  };
  const sidebarContext = {
    ...moduleContext,
    moduleParamsByKey,
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="h-screen flex flex-col bg-gray-100">
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold">WorkTrace</h1>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-4">
              <Calendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />
              {sidebarWidgets.map((widget) => (
                <ModuleErrorBoundary key={`${widget.moduleKey}:${widget.key}`}>
                  {widget.render(sidebarContext)}
                </ModuleErrorBoundary>
              ))}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-medium text-gray-800">{selectedDateText}</h2>
                  <button
                    onClick={handleAddTask}
                    className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    + 添加任务
                  </button>
                </div>
                <div className="relative inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                  {featureModules.map((module) => (
                    <div key={module.key} className="relative">
                      <button
                        onClick={() => handleTabClick(module)}
                        className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                          activeView === module.key
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {module.label}
                      </button>
                      {openNavMenuKey === module.key && module.navChildren?.length > 0 && (
                        <div className="absolute left-0 top-full mt-2 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg z-20">
                          {module.navChildren.map((child) => (
                            <button
                              key={child.key}
                              type="button"
                              onClick={() => handleNavChildClick(module, child)}
                              className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <ModuleErrorBoundary>{activeModule?.render(moduleContext)}</ModuleErrorBoundary>
              </div>

              <div className="bg-white border-t border-gray-200 px-6 py-3">
                <div className="text-sm text-gray-600">
                  本周统计：完成{weekStats.done}/{weekStats.total}
                </div>
              </div>
            </div>
          </div>

          <StatusBar />

          {showModal && (
            <TaskModal
              task={editingTask}
              defaultDueDate={selectedDateValue}
              onSave={handleSaveTask}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
