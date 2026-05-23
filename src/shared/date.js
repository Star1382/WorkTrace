export function parseLocalDate(value) {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return new Date();
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function pad(value) {
  return String(value).padStart(2, '0');
}

export function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatShortDate(value, fallback = '') {
  if (!value) {
    return fallback;
  }
  const date = parseLocalDate(value);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

export function getWeekRange(value) {
  const date = parseLocalDate(value);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end, startValue: formatDate(start), endValue: formatDate(end) };
}

export function getMonthRange(value) {
  const date = parseLocalDate(value);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end, startValue: formatDate(start), endValue: formatDate(end) };
}

export function getWeekDays(value) {
  const { start } = getWeekRange(value);
  return Array.from({ length: 7 }, (_, index) => {
    const item = new Date(start);
    item.setDate(start.getDate() + index);
    return item;
  });
}

export function getMonthCalendar(value) {
  const date = parseLocalDate(value);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  const end = new Date(lastDay);
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const days = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return {
    days,
    month: date.getMonth(),
    title: `${date.getFullYear()}年${date.getMonth() + 1}月`
  };
}
