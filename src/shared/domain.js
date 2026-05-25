// 领域常量统一由 shared/domain.cjs 维护，domain.json 为单一数据源
// 本文件仅作 ESM 重导出，禁止在此修改逻辑
export {
  TASK_STATUS_OPTIONS,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_SYMBOLS,
  PENDING_STATUSES,
  ACTIVE_STATUSES,
  QUADRANTS,
  QUADRANT_OPTIONS,
  QUADRANT_LABELS,
  BOARD_QUADRANTS,
} from '../../shared/domain.cjs';
