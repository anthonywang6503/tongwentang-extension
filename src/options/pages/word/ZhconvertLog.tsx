import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Runtime } from 'webextension-polyfill';
import { i18n } from '../../../service/i18n/i18n';
import { browser } from '../../../service/browser';
import {
  ZHCONVERT_LOG_PORT_NAME,
  type ZhconvertLog as ZhconvertLogEntry,
  type ZhconvertLogMessage,
} from '../../../service/zhconvert/log';
import { Button } from '../../components';

const logStatus = (status: ZhconvertLogEntry['status']) => {
  switch (status) {
    case 'success':
      return i18n.getMessage('MSG_ZHCONVERT_LOG_SUCCESS');
    case 'failure':
      return i18n.getMessage('MSG_ZHCONVERT_LOG_FAILURE');
    case 'cooldown':
      return i18n.getMessage('MSG_ZHCONVERT_LOG_COOLDOWN');
  }
};

export const ZhconvertLog: FC = () => {
  const [logs, setLogs] = useState<ZhconvertLogEntry[]>([]);
  const portRef = useRef<Runtime.Port | null>(null);

  useEffect(() => {
    const port = browser.runtime.connect({ name: ZHCONVERT_LOG_PORT_NAME });
    portRef.current = port;
    const receive = (message: unknown) => {
      const event = message as ZhconvertLogMessage;
      switch (event.type) {
        case 'snapshot':
          setLogs(event.logs);
          break;
        case 'append':
          setLogs(logs => [...logs, event.log]);
      }
    };

    port.onMessage.addListener(receive);
    return () => {
      port.onMessage.removeListener(receive);
      port.disconnect();
      portRef.current = null;
    };
  }, []);

  const clear = useCallback(() => {
    portRef.current?.postMessage({ type: 'clear' });
  }, []);

  return (
    <section className="form-group">
      <div className="columns">
        <div className="column">
          <h6>{i18n.getMessage('MSG_ZHCONVERT_LOG')}</h6>
        </div>
        <div className="column col-auto">
          <Button type="link" onClick={clear}>
            {i18n.getMessage('MSG_ZHCONVERT_LOG_CLEAR')}
          </Button>
        </div>
      </div>
      {logs.length === 0 ? (
        <p className="text-gray">{i18n.getMessage('MSG_ZHCONVERT_LOG_EMPTY')}</p>
      ) : (
        <div style={{ maxHeight: '18rem', overflow: 'auto' }}>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>{i18n.getMessage('MSG_ZHCONVERT_LOG_TIME')}</th>
                <th>{i18n.getMessage('MSG_ZHCONVERT_LOG_STATUS')}</th>
                <th>{i18n.getMessage('MSG_ZHCONVERT_LOG_DURATION')}</th>
                <th>{i18n.getMessage('MSG_ZHCONVERT_LOG_CHAR_COUNT')}</th>
                <th>{i18n.getMessage('MSG_ZHCONVERT_LOG_REASON')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={`${log.time}-${index}`}>
                  <td>{new Date(log.time).toLocaleTimeString()}</td>
                  <td>{logStatus(log.status)}</td>
                  <td>{log.durationMs} ms</td>
                  <td>{log.charCount}</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{log.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
