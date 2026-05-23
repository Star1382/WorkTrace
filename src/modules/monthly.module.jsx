import React from 'react';
import MonthHeatmap from '../components/MonthHeatmap';

export const monthlyModule = {
  key: 'month',
  label: '本月',
  order: 30,
  render: (context) => (
    <MonthHeatmap
      date={context.selectedDateValue}
      refreshKey={context.refreshKey}
      onDateQuickAdd={context.prepareQuickAddForDate}
    />
  )
};
