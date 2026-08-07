import type { ChangeEvent, ChangeEventHandler, FC } from 'react';
import { Fragment, useCallback } from 'react';
import type { PrefWordDefault, PrefZhconvert, ZhconvertConverter } from '../../../preference/types/v2';
import { i18n } from '../../../service/i18n/i18n';
import { Button } from '../../components';
import { Checkbox, Select } from '../../components/forms';
import { ZhconvertLog } from './ZhconvertLog';

const converterOptions: [ZhconvertConverter, string][] = [
  ['Simplified', '簡體化'],
  ['Traditional', '繁體化'],
  ['China', '中國化'],
  ['Hongkong', '香港化'],
  ['Taiwan', '臺灣化'],
  ['Pinyin', '拼音化'],
  ['Bopomofo', '注音化'],
  ['Mars', '火星化'],
  ['WikiSimplified', '維基簡體化'],
  ['WikiTraditional', '維基繁體化'],
];

export const ZhconvertSettings: FC<{
  value: PrefZhconvert;
  onChange: (value: PrefZhconvert) => void;
}> = ({ value, onChange }) => {
  const updateText = (key: 'apiUrl' | 'apiKey') => (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: e.currentTarget.value });
  const updateConverter = (key: 's2tConverter' | 't2sConverter') => (e: ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...value, [key]: e.currentTarget.value as ZhconvertConverter });
  const updateNumber =
    (key: 'tryCount' | 'timeoutMs' | 'cooldownMs' | 'concurrency', min: number, max: number, fallback: number) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = Number.parseInt(e.currentTarget.value, 10);
      onChange({ ...value, [key]: Number.isFinite(next) ? Math.min(max, Math.max(min, next)) : fallback });
    };

  return (
    <div className="form-group">
      <h6>{i18n.getMessage('MSG_ZHCONVERT_SETTINGS')}</h6>
      <p className="text-gray">
        {i18n.getMessage('MSG_ZHCONVERT_NOTICE')}{' '}
        <a href="https://zhconvert.org" target="_blank" rel="noreferrer">
          zhconvert.org
        </a>
      </p>
      <label className="form-label" htmlFor="zhconvert-api-url">
        {i18n.getMessage('MSG_ZHCONVERT_API_URL')}
      </label>
      <input
        id="zhconvert-api-url"
        className="form-input"
        type="url"
        value={value.apiUrl}
        onChange={updateText('apiUrl')}
      />
      <label className="form-label" htmlFor="zhconvert-api-key">
        {i18n.getMessage('MSG_ZHCONVERT_API_KEY')}
      </label>
      <input
        id="zhconvert-api-key"
        className="form-input"
        type="password"
        value={value.apiKey}
        onChange={updateText('apiKey')}
      />
      <Select
        id="zhconvert-s2t-converter"
        label={i18n.getMessage('MSG_ZHCONVERT_S2T_CONVERTER')}
        value={value.s2tConverter}
        onChange={updateConverter('s2tConverter')}
      >
        {converterOptions.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
      <Select
        id="zhconvert-t2s-converter"
        label={i18n.getMessage('MSG_ZHCONVERT_T2S_CONVERTER')}
        value={value.t2sConverter}
        onChange={updateConverter('t2sConverter')}
      >
        {converterOptions.map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
      <label className="form-label" htmlFor="zhconvert-try-count">
        {i18n.getMessage('MSG_ZHCONVERT_TRY_COUNT')}{' '}
        <span className="text-gray">（{i18n.getMessage('MSG_ZHCONVERT_RECOMMENDED')}：2）</span>
      </label>
      <input
        id="zhconvert-try-count"
        className="form-input"
        type="number"
        min="1"
        max="5"
        value={value.tryCount}
        onChange={updateNumber('tryCount', 1, 5, 2)}
      />
      <label className="form-label" htmlFor="zhconvert-timeout">
        {i18n.getMessage('MSG_ZHCONVERT_TIMEOUT')}{' '}
        <span className="text-gray">（{i18n.getMessage('MSG_ZHCONVERT_RECOMMENDED')}：3000 ms）</span>
      </label>
      <input
        id="zhconvert-timeout"
        className="form-input"
        type="number"
        min="500"
        max="30000"
        step="100"
        value={value.timeoutMs}
        onChange={updateNumber('timeoutMs', 500, 30000, 3000)}
      />
      <label className="form-label" htmlFor="zhconvert-cooldown">
        {i18n.getMessage('MSG_ZHCONVERT_COOLDOWN')}{' '}
        <span className="text-gray">（{i18n.getMessage('MSG_ZHCONVERT_RECOMMENDED')}：30000 ms）</span>
      </label>
      <input
        id="zhconvert-cooldown"
        className="form-input"
        type="number"
        min="1000"
        max="3600000"
        step="1000"
        value={value.cooldownMs}
        onChange={updateNumber('cooldownMs', 1000, 3600000, 30000)}
      />
      <label className="form-label" htmlFor="zhconvert-concurrency">
        {i18n.getMessage('MSG_ZHCONVERT_CONCURRENCY')}{' '}
        <span className="text-gray">（{i18n.getMessage('MSG_ZHCONVERT_RECOMMENDED')}：3）</span>
      </label>
      <input
        id="zhconvert-concurrency"
        className="form-input"
        type="number"
        min="1"
        max="10"
        value={value.concurrency}
        onChange={updateNumber('concurrency', 1, 10, 3)}
      />
    </div>
  );
};

export const WordDefaultSettings: FC<{
  value: PrefWordDefault;
  zhconvert: PrefZhconvert;
  onChange: (d: PrefWordDefault) => void;
  onZhconvertChange: (value: PrefZhconvert) => void;
  onSave: () => Promise<unknown>;
}> = ({
  value: defWord,
  zhconvert,
  onChange: handleChange,
  onZhconvertChange: handleZhconvertChange,
  onSave: handleSave,
}) => {
  const upSc: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      ((d, char) => {
        handleChange(((d.s2t = { ...d.s2t, char }), d));
      })({ ...defWord }, e.currentTarget.checked);
    },
    [handleChange, defWord],
  );
  const upSp: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      ((d, phrase) => {
        handleChange(((d.s2t = { ...d.s2t, phrase }), d));
      })({ ...defWord }, e.currentTarget.checked);
    },
    [handleChange, defWord],
  );
  const upTc: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      ((d, char) => {
        handleChange(((d.t2s = { ...d.t2s, char }), d));
      })({ ...defWord }, e.currentTarget.checked);
    },
    [handleChange, defWord],
  );
  const upTp: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      ((d, phrase) => {
        handleChange(((d.t2s = { ...d.t2s, phrase }), d));
      })({ ...defWord }, e.currentTarget.checked);
    },
    [handleChange, defWord],
  );
  const upScZhconvert: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => handleChange({ ...defWord, s2t: { ...defWord.s2t, zhconvert: e.currentTarget.checked } }),
    [handleChange, defWord],
  );
  const upTcZhconvert: ChangeEventHandler<HTMLInputElement> = useCallback(
    e => handleChange({ ...defWord, t2s: { ...defWord.t2s, zhconvert: e.currentTarget.checked } }),
    [handleChange, defWord],
  );

  return (
    <Fragment>
      <Checkbox
        isSwitch={true}
        label={i18n.getMessage('MSG_DEFAULT_S2T_CHAR')}
        checked={defWord.s2t.char}
        onChange={upSc}
      />
      <Checkbox
        isSwitch={true}
        label={i18n.getMessage('MSG_DEFAULT_S2T_WORD')}
        checked={defWord.s2t.phrase}
        onChange={upSp}
      />
      <Checkbox
        isSwitch={true}
        label={i18n.getMessage('MSG_DEFAULT_S2T_ZHCONVERT')}
        checked={defWord.s2t.zhconvert}
        onChange={upScZhconvert}
      />
      <Checkbox
        isSwitch={true}
        label={i18n.getMessage('MSG_DEFAULT_T2S_CHAR')}
        checked={defWord.t2s.char}
        onChange={upTc}
      />
      <Checkbox
        isSwitch={true}
        label={i18n.getMessage('MSG_DEFAULT_T2S_WORD')}
        checked={defWord.t2s.phrase}
        onChange={upTp}
      />
      <Checkbox
        isSwitch={true}
        label={i18n.getMessage('MSG_DEFAULT_T2S_ZHCONVERT')}
        checked={defWord.t2s.zhconvert}
        onChange={upTcZhconvert}
      />
      <ZhconvertSettings value={zhconvert} onChange={handleZhconvertChange} />
      <ZhconvertLog />
      <Button type="primary" onClick={handleSave}>
        {i18n.getMessage('MSG_SAVE')}
      </Button>
    </Fragment>
  );
};
