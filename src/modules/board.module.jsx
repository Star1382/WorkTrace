import React from 'react';
import QuadrantBoard from '../components/QuadrantBoard';
import QuadrantSidebar from '../components/QuadrantSidebar';

export const boardModule = {
  key: 'board',
  label: '四象限',
  order: 40,
  sidebarWidgets: [
    {
      key: 'quadrant-sidebar',
      order: 10,
      render: (context) => (
        <QuadrantSidebar refreshKey={context.refreshKey} openModule={context.openModule} />
      ),
    },
  ],
  render: (context) => (
    <QuadrantBoard
      refreshKey={context.refreshKey}
      selectedQuadrantId={context.moduleParams?.selectedQuadrantId}
      onSelectQuadrant={(selectedQuadrantId) =>
        context.setModuleParams('board', { selectedQuadrantId })
      }
      onTaskMoved={context.refreshAll}
      onEditTask={context.handleEditTask}
      onToggleStatus={context.handleToggleStatus}
    />
  ),
};
