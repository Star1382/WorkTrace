import React from 'react';
import ReportPanel from './ReportPanel';

function ReportView({ type, date, refreshKey }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {type === 'monthly' ? '月报' : '周报'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">从顶部“报表”入口选择周报或月报。</p>
      </div>
      <ReportPanel type={type} date={date} refreshKey={refreshKey} />
    </div>
  );
}

export default ReportView;
