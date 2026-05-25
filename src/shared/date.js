// 所有日期工具函数统一由 shared/date.cjs 维护
// 本文件仅作 ESM 重导出，禁止在此修改逻辑
export {
  parseLocalDate,
  formatDate,
  formatShortDate,
  getWeekRange,
  getMonthRange,
  getWeekDays,
  getMonthCalendar,
} from '../../shared/date.cjs';
