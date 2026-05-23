import React from 'react';
import QuadrantBoard from '../components/QuadrantBoard';

export const boardModule = {
  key: 'board',
  label: '看板',
  order: 20,
  render: (context) => (
    <QuadrantBoard
      refreshKey={context.refreshKey}
      onTaskMoved={context.refreshAll}
      onEditTask={context.handleEditTask}
      onToggleStatus={context.handleToggleStatus}
    />
  )
};
