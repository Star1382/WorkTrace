import React from 'react';

/**
 * 欢迎引导面板 —— 新用户首次打开时显示
 * 数据库为空时替代空列表，引导用户快速上手
 */
function WelcomeGuide({ onDismiss, isCreating }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-lg mx-auto text-center">
      <div className="text-4xl mb-4">📋</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">欢迎使用 WorkTrace</h2>
      <p className="text-sm text-gray-500 mb-6">三分钟上手，轻松管理工作任务</p>

      <div className="space-y-3 mb-6 text-left">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
            1
          </span>
          <div>
            <p className="text-sm font-medium text-gray-800">智能添加任务</p>
            <p className="text-xs text-gray-500 mt-0.5">
              在上方输入框输入「明天交周报<strong>[紧急]</strong>」试试 —— 日期和优先级自动识别
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">
            2
          </span>
          <div>
            <p className="text-sm font-medium text-gray-800">点击完成</p>
            <p className="text-xs text-gray-500 mt-0.5">
              点击任务左侧圆圈标记完成，右键切换状态（待办 / 进行中 / 阻塞）
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
            3
          </span>
          <div>
            <p className="text-sm font-medium text-gray-800">一键生成周报</p>
            <p className="text-xs text-gray-500 mt-0.5">
              切到「报表」标签 → 选择周报，自动汇总本周完成情况，一键复制发给领导
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        disabled={isCreating}
        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {isCreating ? '正在创建示例...' : '创建示例任务，立即体验'}
      </button>
      <p className="text-xs text-gray-400 mt-3">会创建 5 条不同优先级的示例任务，可以随时删除</p>
    </div>
  );
}

export default React.memo(WelcomeGuide);
