import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import StatusBar from './components/StatusBar';
import { taskService } from './services/taskService';
import { statsService } from './services/statsService';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [quadrantStats, setQuadrantStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [weekStats, setWeekStats] = useState({ total: 0, done: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
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

  const handleAddTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await taskService.update({ ...taskData, id: editingTask.id });
    } else {
      await taskService.add({ ...taskData, due_date: formatDate(selectedDate) });
    }
    setShowModal(false);
    loadTasks();
    loadStats();
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    await taskService.toggleStatus(taskId, newStatus);
    loadTasks();
    loadStats();
  };

  const handleDeleteTask = async (taskId) => {
    await taskService.delete(taskId);
    loadTasks();
    loadStats();
  };

  return (
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
                  <span>紧急重要</span>
                </div>
                <span className="font-medium">{quadrantStats[1]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                  <span>紧急不重要</span>
                </div>
                <span className="font-medium">{quadrantStats[2]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  <span>重要不紧急</span>
                </div>
                <span className="font-medium">{quadrantStats[3]}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  <span>不重要不紧急</span>
                </div>
                <span className="font-medium">{quadrantStats[4]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-medium text-gray-800">
              {selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </h2>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <TaskList
              tasks={tasks}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAdd={handleAddTask}
            />
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
          onSave={handleSaveTask}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default App;
