import React from 'react';

/**
 * 欢迎引导面板 —— 新用户首次打开时显示
 * 优先介绍小黄条（开机即见），再引导主窗口操作
 */
function WelcomeGuide({ onDismiss, isCreating }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-lg mx-auto text-center">
      <div className="text-4xl mb-4">📋</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">欢迎使用 WorkTrace</h2>
      <p className="text-sm text-gray-500 mb-6">
        屏幕右侧有个小黄条？那是你的快捷任务栏，下面告诉你它怎么用 👇
      </p>

      <div className="space-y-3 mb-6 text-left">
        <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center font-bold">
            0
          </span>
          <div>
            <p className="text-sm font-medium text-gray-800">小黄条 · 桌面悬浮窗</p>
            <p className="text-xs text-gray-500 mt-0.5">
              开机自动出现在屏幕右上角，始终在顶层，看一眼就知道今天要干嘛。
              点击任务直接标记完成，点「添加」切回主窗口详细编辑。
              用 <strong>Ctrl+Shift+W</strong> 可以随时显示/隐藏它。
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
            1
          </span>
          <div>
            <p className="text-sm font-medium text-gray-800">智能添加任务</p>
            <p className="text-xs text-gray-500 mt-0.5">
              在上方输入框输入「明天交周报<strong>[紧急]</strong>」回车创建 ——
              日期和优先级自动识别，不用手动填
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">
            2
          </span>
          <div>
            <p className="text-sm font-medium text-gray-800">标记完成与切换状态</p>
            <p className="text-xs text-gray-500 mt-0.5">
              点击任务左侧圆圈完成，右键任务切换状态（待办 / 进行中 / 阻塞）。
              快捷键：<strong>Delete</strong> 删除 · <strong>Enter</strong> 编辑 · <strong>Ctrl+N</strong> 新建
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
              切到「报表」→ 选周报，自动汇总本周完成情况，一键复制发给领导。
              <strong>Ctrl+1~4</strong> 快速切换视图
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
      <p className="text-xs text-gray-400 mt-3">
        会创建 5 条不同优先级的示例任务，可以随时删除
      </p>
    </div>
  );
}

export default React.memo(WelcomeGuide);
