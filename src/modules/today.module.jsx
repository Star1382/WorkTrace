import React from 'react';
import TaskList from '../components/TaskList';

export const todayModule = {
  key: 'today',
  label: '今日',
  order: 10,
  render: (context) => (
    <TaskList
      tasks={context.tasks}
      highlightedTaskId={context.highlightedTaskId}
      selectedTaskId={context.selectedTaskId}
      onSelectTask={context.setSelectedTaskId}
      onToggleStatus={context.handleToggleStatus}
      onChangeStatus={context.handleChangeStatus}
      onEdit={context.handleEditTask}
      onDelete={context.handleDeleteTask}
      onAdd={context.handleAddTask}
    />
  )
};
