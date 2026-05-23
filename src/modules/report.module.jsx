import React from 'react';
import ReportView from '../components/ReportView';

export const reportModule = {
  key: 'reports',
  label: '报表',
  order: 50,
  defaultNavChildKey: 'weekly',
  navChildren: [
    { key: 'weekly', label: '周报' },
    { key: 'monthly', label: '月报' }
  ],
  render: (context) => (
    <ReportView
      type={context.activeNavChildKey || 'weekly'}
      date={context.selectedDateValue}
      refreshKey={context.refreshKey}
    />
  )
};
