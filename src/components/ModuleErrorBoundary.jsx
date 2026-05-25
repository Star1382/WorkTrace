import React from 'react';

/**
 * 轻量级模块错误边界
 * 只显示模块区域内的错误提示，不影响应用其他部分
 */
class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ModuleErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            模块加载失败：{this.state.error?.message || '未知错误'}
          </p>
          <p className="text-xs text-red-500 mt-1">
            其他功能不受影响，可以切换到其他视图继续使用。
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ModuleErrorBoundary;
