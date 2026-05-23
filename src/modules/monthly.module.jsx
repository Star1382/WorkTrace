import React from 'react';
import MonthlyReport from '../components/MonthlyReport';

export const monthlyModule = {
  key: 'monthly',
  label: '月报',
  order: 40,
  render: (context) => (
    <MonthlyReport date={context.selectedDateValue} refreshKey={context.refreshKey} />
  )
};
