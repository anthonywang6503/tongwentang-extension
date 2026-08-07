import { LangType } from 'tongwen-core/dictionaries';
import type { PrefZhconvert } from '../../preference/types/v2';
import { i18n } from '../../service/i18n/i18n';
import { createNoti } from '../../service/notification/create-noti';

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

interface PendingRequest {
  config: PrefZhconvert;
  execute: () => Promise<string | undefined>;
  resolve: (value: string | undefined) => void;
}

const pendingRequests: PendingRequest[] = [];

const converterFor = (target: LangType, config: PrefZhconvert) =>
  target === LangType.s2t ? config.s2tConverter : config.t2sConverter;

const request = async (target: LangType, text: string, config: PrefZhconvert): Promise<string> => {
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

    return result.data.text;
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
  pendingRequests.splice(0).forEach(({ resolve }) => resolve(undefined));
};

const drainRequests = () => {
  while (pendingRequests.length > 0 && activeRequests < pendingRequests[0].config.concurrency) {
    const pending = pendingRequests.shift()!;
    if (Date.now() < cooldownUntil) {
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

const enqueueRequest = (config: PrefZhconvert, execute: () => Promise<string | undefined>) =>
  new Promise<string | undefined>(resolve => {
    pendingRequests.push({ config, execute, resolve });
    drainRequests();
  });

const convertRequest = async (target: LangType, text: string, config: PrefZhconvert): Promise<string | undefined> => {
  for (let attempt = 0; attempt < config.tryCount; attempt += 1) {
    if (Date.now() < cooldownUntil) return undefined;

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
  if (text === '' || Date.now() < cooldownUntil) return Promise.resolve(undefined);
  return enqueueRequest(config, () => convertRequest(target, text, config));
};
