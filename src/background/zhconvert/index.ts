import { LangType } from 'tongwen-core/dictionaries';
import type { PrefZhconvert } from '../../preference/types/v2';
import { i18n } from '../../service/i18n/i18n';
import { createNoti } from '../../service/notification/create-noti';
import { browser } from '../../service/browser';
import {
  ZHCONVERT_LOG_PORT_NAME,
  type ZhconvertLog,
  type ZhconvertLogMessage,
  type ZhconvertLogRequest,
} from '../../service/zhconvert/log';
import type { Runtime } from 'webextension-polyfill';

interface ZhconvertResponse {
  code: number;
  msg?: string;
  data?: {
    text?: string;
  };
}

let cooldownUntil = 0;
let notificationUntil = 0;
let activeRequests = 0;
const logs: ZhconvertLog[] = [];
const logPorts = new Set<Runtime.Port>();

interface PendingRequest {
  config: PrefZhconvert;
  target: LangType;
  text: string;
  execute: () => Promise<string | undefined>;
  resolve: (value: string | undefined) => void;
}

const pendingRequests: PendingRequest[] = [];

const converterFor = (target: LangType, config: PrefZhconvert) =>
  target === LangType.s2t ? config.s2tConverter : config.t2sConverter;

const postLogMessage = (port: Runtime.Port, message: ZhconvertLogMessage) => {
  try {
    port.postMessage(message);
  } catch {
    logPorts.delete(port);
  }
};

const broadcastLogMessage = (message: ZhconvertLogMessage) => {
  logPorts.forEach(port => postLogMessage(port, message));
};

const appendLog = (log: ZhconvertLog) => {
  logs.push(log);
  logs.length > 100 && logs.shift();
  broadcastLogMessage({ type: 'append', log });
};

const appendCooldownLog = (target: LangType, text: string) =>
  appendLog({
    time: Date.now(),
    durationMs: 0,
    charCount: Array.from(text).length,
    target,
    status: 'cooldown',
    reason: i18n.getMessage('MSG_ZHCONVERT_LOG_COOLDOWN_REASON'),
  });

export const mountZhconvertLogListener = () => {
  browser.runtime.onConnect.addListener(port => {
    if (port.name !== ZHCONVERT_LOG_PORT_NAME) return;

    logPorts.add(port);
    postLogMessage(port, { type: 'snapshot', logs });
    port.onMessage.addListener((message: unknown) => {
      if ((message as ZhconvertLogRequest).type !== 'clear') return;
      logs.splice(0);
      broadcastLogMessage({ type: 'snapshot', logs });
    });
    port.onDisconnect.addListener(() => {
      logPorts.delete(port);
    });
  });
};

const request = async (target: LangType, text: string, config: PrefZhconvert): Promise<string> => {
  const time = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, config.timeoutMs);

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams({
        apiKey: config.apiKey,
        outputFormat: 'json',
        prettify: 'false',
        text,
        converter: converterFor(target, config),
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = (await response.json()) as ZhconvertResponse;
    if (result.code !== 0 || typeof result.data?.text !== 'string') {
      throw new Error(result.msg || 'zhconvert API error');
    }

    appendLog({
      time,
      durationMs: Date.now() - time,
      charCount: Array.from(text).length,
      target,
      status: 'success',
    });
    return result.data.text;
  } catch (error) {
    appendLog({
      time,
      durationMs: Date.now() - time,
      charCount: Array.from(text).length,
      target,
      status: 'failure',
      reason: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const reportFailure = (config: PrefZhconvert) => {
  const now = Date.now();
  cooldownUntil = now + config.cooldownMs;
  if (now >= notificationUntil) {
    notificationUntil = cooldownUntil;
    void createNoti(i18n.getMessage('NT_ZHCONVERT_FAILED'), 3000, 'zhconvert-failed');
  }
  pendingRequests.splice(0).forEach(({ target, text, resolve }) => {
    appendCooldownLog(target, text);
    resolve(undefined);
  });
};

const drainRequests = () => {
  while (pendingRequests.length > 0 && activeRequests < pendingRequests[0].config.concurrency) {
    const pending = pendingRequests.shift()!;
    if (Date.now() < cooldownUntil) {
      appendCooldownLog(pending.target, pending.text);
      pending.resolve(undefined);
      continue;
    }

    activeRequests += 1;
    void pending
      .execute()
      .then(pending.resolve)
      .finally(() => {
        activeRequests -= 1;
        drainRequests();
      });
  }
};

const enqueueRequest = (
  target: LangType,
  text: string,
  config: PrefZhconvert,
  execute: () => Promise<string | undefined>,
) =>
  new Promise<string | undefined>(resolve => {
    pendingRequests.push({ config, target, text, execute, resolve });
    drainRequests();
  });

const convertRequest = async (target: LangType, text: string, config: PrefZhconvert): Promise<string | undefined> => {
  for (let attempt = 0; attempt < config.tryCount; attempt += 1) {
    if (Date.now() < cooldownUntil) {
      appendCooldownLog(target, text);
      return undefined;
    }

    try {
      return await request(target, text, config);
    } catch {
      // Retry immediately; the final failure falls back to the local converter.
    }
  }

  reportFailure(config);
  return undefined;
};

export const convertWithZhconvert = (
  target: LangType,
  text: string,
  config: PrefZhconvert,
): Promise<string | undefined> => {
  if (text === '') return Promise.resolve(undefined);
  if (Date.now() < cooldownUntil) {
    appendCooldownLog(target, text);
    return Promise.resolve(undefined);
  }
  return enqueueRequest(target, text, config, () => convertRequest(target, text, config));
};
