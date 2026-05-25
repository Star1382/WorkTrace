import React, { forwardRef, useEffect, useRef, useState } from 'react';

/**
 * 快速添加输入框
 * 处理输入、回车创建、外部预填草稿
 */
const QuickAddInput = forwardRef(function QuickAddInput({ draft, onQuickAdd }, ref) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const localRef = useRef(null);
  const inputRef = ref || localRef;

  // 外部预填草稿（从周/月视图点击日期后触发）
  useEffect(() => {
    if (!draft) return;
    setText(draft.text || '');
    window.setTimeout(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 0);
  }, [draft, inputRef]);

  const handleKeyDown = async (event) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const result = await onQuickAdd(trimmed);
    if (result.success) {
      setText('');
      setMessage('');
    } else {
      setMessage(result.error || '快速创建失败');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <input
        ref={inputRef}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setMessage('');
        }}
        onKeyDown={handleKeyDown}
        placeholder="输入任务，回车创建"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
      {message && <div className="mt-2 text-xs text-red-600">{message}</div>}
    </div>
  );
});

export default QuickAddInput;
