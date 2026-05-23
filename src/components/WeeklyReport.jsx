import React from 'react';
import ReportPanel from './ReportPanel';

function WeeklyReport({ date, refreshKey }) {
  return <ReportPanel type="weekly" date={date} refreshKey={refreshKey} />;
}

export default WeeklyReport;
