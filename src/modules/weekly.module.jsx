import React from 'react';
import WeekView from '../components/WeekView';

export const weeklyModule = {
  key: 'week',
  label: '本周',
  order: 20,
  render: (context) => (
    <WeekView
      date={context.selectedDateValue}
      refreshKey={context.refreshKey}
      onDateQuickAdd={context.prepareQuickAddForDate}
    />
  ),
};
