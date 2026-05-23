const domainData = require('./domain.json');

function toConstantKey(value) {
  return String(value).toUpperCase();
}

const TASK_STATUS_OPTIONS = domainData.taskStatuses;
const TASK_STATUS = Object.fromEntries(
  TASK_STATUS_OPTIONS.map((status) => [toConstantKey(status.value), status.value])
);
const TASK_STATUS_LABELS = Object.fromEntries(
  TASK_STATUS_OPTIONS.map((status) => [status.value, status.label])
);
const TASK_STATUS_SYMBOLS = Object.fromEntries(
  TASK_STATUS_OPTIONS.map((status) => [status.value, status.symbol])
);

const PENDING_STATUSES = domainData.pendingStatuses;
const ACTIVE_STATUSES = PENDING_STATUSES;

const QUADRANTS = domainData.quadrants;
const QUADRANT_OPTIONS = QUADRANTS.map(({ id, title }) => ({
  value: id,
  label: title
}));
const QUADRANT_LABELS = Object.fromEntries(
  QUADRANTS.map((quadrant) => [quadrant.id, quadrant.title])
);
const BOARD_QUADRANTS = QUADRANTS.filter((quadrant) => quadrant.id > 0);

module.exports = {
  TASK_STATUS,
  TASK_STATUS_OPTIONS,
  TASK_STATUS_LABELS,
  TASK_STATUS_SYMBOLS,
  PENDING_STATUSES,
  ACTIVE_STATUSES,
  QUADRANTS,
  QUADRANT_OPTIONS,
  QUADRANT_LABELS,
  BOARD_QUADRANTS
};
