import React from 'react';

function StatusBar() {
  return (
    <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          本地存储 ✓
        </span>
      </div>
      <div>
        WorkTrace v1.0.0
      </div>
    </div>
  );
}

export default StatusBar;
