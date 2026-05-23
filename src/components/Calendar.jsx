import React, { useState } from 'react';

function Calendar({ selectedDate, onSelectDate }) {
  const [viewMonth, setViewMonth] = useState(new Date());

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const prevMonth = () => {
    setViewMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(new Date());
  };

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const selectedStr = selectedDate.toISOString().split('T')[0];

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-8"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedStr;

    days.push(
      <div
        key={day}
        onClick={() => onSelectDate(date)}
        className={`h-8 flex items-center justify-center rounded cursor-pointer text-sm
          ${isSelected ? 'bg-blue-600 text-white font-medium' : ''}
          ${isToday && !isSelected ? 'bg-blue-100 text-blue-700 font-medium' : ''}
          hover:bg-gray-100 ${isSelected ? '' : ''}
        `}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded text-gray-600">
          ◀
        </button>
        <div className="text-sm font-medium text-gray-700">
          {year}年 {monthNames[month]}
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded text-gray-600">
          ▶
        </button>
      </div>

      <button
        onClick={goToToday}
        className="w-full mb-3 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
      >
        今天
      </button>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 relative">
        {days}
      </div>
    </div>
  );
}

export default Calendar;
