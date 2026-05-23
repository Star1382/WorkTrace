/**
 * statsService.js - 统计相关 API
 */
import { invoke } from './ipc';

export const statsService = {
  getQuadrant: () => invoke('stats:getQuadrant'),
  getWeek: () => invoke('stats:getWeek')
};
