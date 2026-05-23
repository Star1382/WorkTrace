import React from 'react';
import ReportPanel from './ReportPanel';

function MonthlyReport({ date, refreshKey }) {
  return <ReportPanel type="monthly" date={date} refreshKey={refreshKey} />;
}

export default MonthlyReport;
