import domainData from '../../shared/domain.json';

function toConstantKey(value) {
  return String(value).toUpperCase();
}

export const TASK_STATUS_OPTIONS = domainData.taskStatuses;
export const TASK_STATUS = Object.fromEntries(
  TASK_STATUS_OPTIONS.map((status) => [toConstantKey(status.value), status.value])
);
export const TASK_STATUS_LABELS = Object.fromEntries(
  TASK_STATUS_OPTIONS.map((status) => [status.value, status.label])
);
export const TASK_STATUS_SYMBOLS = Object.fromEntries(
  TASK_STATUS_OPTIONS.map((status) => [status.value, status.symbol])
);

export const PENDING_STATUSES = domainData.pendingStatuses;
export const ACTIVE_STATUSES = PENDING_STATUSES;

export const QUADRANTS = domainData.quadrants;
export const QUADRANT_OPTIONS = QUADRANTS.map(({ id, title }) => ({
  value: id,
  label: title
}));
export const QUADRANT_LABELS = Object.fromEntries(
  QUADRANTS.map((quadrant) => [quadrant.id, quadrant.title])
);
export const BOARD_QUADRANTS = QUADRANTS.filter((quadrant) => quadrant.id > 0);
