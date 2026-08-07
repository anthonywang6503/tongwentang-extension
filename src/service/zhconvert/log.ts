import type { LangType } from 'tongwen-core/dictionaries';

export const ZHCONVERT_LOG_PORT_NAME = 'zhconvert-log';

export interface ZhconvertLog {
  time: number;
  durationMs: number;
  charCount: number;
  target: LangType;
  status: 'success' | 'failure' | 'cooldown';
  reason?: string;
}

export type ZhconvertLogMessage = { type: 'snapshot'; logs: ZhconvertLog[] } | { type: 'append'; log: ZhconvertLog };

export type ZhconvertLogRequest = { type: 'clear' };
