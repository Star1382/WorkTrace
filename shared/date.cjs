function parseLocalDate(value) {
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

function formatDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDateTime(date) {
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function formatShortDate(value) {
  if (!value) {
    return '';
  }
  const date = parseLocalDate(value);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function formatPeriodDate(value) {
  const date = parseLocalDate(value);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function getWeekRange(value) {
  const date = parseLocalDate(value);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end, startValue: formatDate(start), endValue: formatDate(end) };
}

function getMonthRange(value) {
  const date = parseLocalDate(value);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end, startValue: formatDate(start), endValue: formatDate(end) };
}

module.exports = {
  parseLocalDate,
  formatDate,
  formatDateTime,
  formatShortDate,
  formatPeriodDate,
  getWeekRange,
  getMonthRange
};
