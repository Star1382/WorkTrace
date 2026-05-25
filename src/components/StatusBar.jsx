import React, { useState } from 'react';

function StatusBar() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const show = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleExportDB = async () => {
    setBusy(true);
    try {
      const result = await window.electronAPI.backup.export();
      if (result.success) {
        show('数据库已导出');
      } else if (result.error !== '取消导出') {
        show('导出失败: ' + result.error);
      }
    } catch (err) {
      show('导出异常: ' + err.message);
    }
    setBusy(false);
  };

  const handleExportJSON = async () => {
    setBusy(true);
    try {
      const result = await window.electronAPI.backup.exportJSON();
      if (result.success) {
        show(`已导出 ${result.data?.count || 0} 条任务`);
      } else if (result.error !== '取消导出') {
        show('导出失败: ' + result.error);
      }
    } catch (err) {
      show('导出异常: ' + err.message);
    }
    setBusy(false);
  };

  const handleImport = async () => {
    const ok = window.confirm('导入将覆盖当前所有数据，确定继续？');
    if (!ok) return;
    setBusy(true);
    try {
      const result = await window.electronAPI.backup.import();
      if (result.success) {
        show('数据已导入，请重启应用');
      } else if (result.error !== '取消导入') {
        show('导入失败: ' + result.error);
      }
    } catch (err) {
      show('导入异常: ' + err.message);
    }
    setBusy(false);
  };

  return (
    <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          本地存储 ✓
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportDB}
            disabled={busy}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            {busy ? '...' : '导出备份'}
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={busy}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            JSON
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={busy}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            导入
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {msg && <span className="text-green-400">{msg}</span>}
        <span>WorkTrace v1.0.0</span>
      </div>
    </div>
  );
}

export default StatusBar;
