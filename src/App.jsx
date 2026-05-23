import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar';
import TaskModal from './components/TaskModal';
import StatusBar from './components/StatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { taskService } from './services/taskService';
import { statsService } from './services/statsService';
import { defaultModuleKey, featureModules } from './modules';
import * as domain from './shared/domain.js';

const { TASK_STATUS, QUADRANT_LABELS } = domain;

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState(defaultModuleKey);
  const [tasks, setTasks] = useState([]);
  const [quadrantStats, setQuadrantStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [weekStats, setWeekStats] = useState({ total: 0, done: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseLocalDate = (value) => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      return new Date();
    }
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  };

  const loadTasks = useCallback(async () => {
    const result = await taskService.getByDate(formatDate(selectedDate));
    if (result.success) {
      setTasks(result.data);
    }
  }, [selectedDate]);

  const loadStats = useCallback(async () => {
    const quadResult = await statsService.getQuadrant();
    if (quadResult.success) {
      setQuadrantStats(quadResult.data);
    }
    const weekResult = await statsService.getWeek();
    if (weekResult.success) {
      setWeekStats(weekResult.data);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [loadTasks, loadStats]);

  useEffect(() => {
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [tasks, selectedTaskId]);

  const handleAddTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const refreshAll = () => {
    loadTasks();
    loadStats();
    setRefreshKey((key) => key + 1);
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await taskService.update({ ...taskData, id: editingTask.id });
    } else {
      await taskService.add({ ...taskData, due_date: taskData.due_date || formatDate(selectedDate) });
    }
    setShowModal(false);
    refreshAll();
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
    weekday: 'long'
  });

  const tabs = featureModules.map(({ key, label }) => ({ key, label }));

  useEffect(() => {
    if (!window.electronAPI?.on) {
      return undefined;
    }

    return window.electronAPI.on('reminder:focusTask', (task) => {
      if (task?.due_date) {
        setSelectedDate(parseLocalDate(task.due_date));
      }
      setActiveView('today');
      setSelectedTaskId(task.id);
      setHighlightedTaskId(task.id);
      setRefreshKey((key) => key + 1);
      window.setTimeout(() => setHighlightedTaskId(null), 8000);
    });
  }, []);

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
          setActiveView(tabs[index].key);
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
  }, [showModal, selectedTaskId, tasks]);

  const selectedDateValue = formatDate(selectedDate);
  const activeModule = featureModules.find((module) => module.key === activeView) || featureModules[0];
  const moduleContext = {
    tasks,
    highlightedTaskId,
    selectedTaskId,
    selectedDate,
    selectedDateValue,
    refreshKey,
    setSelectedDate,
    setSelectedTaskId,
    handleAddTask,
    handleEditTask,
    handleSaveTask,
    handleToggleStatus,
    handleChangeStatus,
    handleDeleteTask,
    refreshAll
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
          <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <div className="mt-6 flex-1">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">四象限统计</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  <span>{QUADRANT_LABELS[1]}</span>
                </div>
                <span className="font-medium">{quadrantStats[1]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                  <span>{QUADRANT_LABELS[2]}</span>
                </div>
                <span className="font-medium">{quadrantStats[2]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  <span>{QUADRANT_LABELS[3]}</span>
                </div>
                <span className="font-medium">{quadrantStats[3]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <span>{QUADRANT_LABELS[4]}</span>
                </div>
                <span className="font-medium">{quadrantStats[4]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-6 py-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-medium text-gray-800">
                {selectedDateText}
              </h2>
              <button
                onClick={handleAddTask}
                className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                + 添加任务
              </button>
            </div>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key)}
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                    activeView === tab.key
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {activeModule?.render(moduleContext)}
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
          defaultDueDate={formatDate(selectedDate)}
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
