import React from 'react';
import WeeklyReport from '../components/WeeklyReport';

export const weeklyModule = {
  key: 'weekly',
  label: '周报',
  order: 30,
  render: (context) => (
    <WeeklyReport date={context.selectedDateValue} refreshKey={context.refreshKey} />
  )
};
