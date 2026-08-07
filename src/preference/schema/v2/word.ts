import type { Control } from 'data-fixer';
import { dctrl, rctrl, vctrl } from 'data-fixer';
import { z } from 'zod';
import type { PrefWord, PrefZhconvert, ZhconvertConverter } from '../../types/v2';
import { isBoolean, isString } from '../controllers';
import { vldFn } from '../validator';

const zhconvertConverters: [ZhconvertConverter, ...ZhconvertConverter[]] = [
  'Simplified',
  'Traditional',
  'China',
  'Hongkong',
  'Taiwan',
  'Pinyin',
  'Bopomofo',
  'Mars',
  'WikiSimplified',
  'WikiTraditional',
];

const isZhconvertConverter = (alt: ZhconvertConverter) => vctrl(vldFn(z.enum(zhconvertConverters)), alt);

const zhconvertSchema: Control<PrefZhconvert> = dctrl({
  apiUrl: vctrl(vldFn(z.string().url()), 'https://api.zhconvert.org/convert'),
  apiKey: isString,
  s2tConverter: isZhconvertConverter('Traditional'),
  t2sConverter: isZhconvertConverter('Simplified'),
  tryCount: vctrl(vldFn(z.number().int().min(1).max(5)), 2),
  timeoutMs: vctrl(vldFn(z.number().int().min(500).max(30000)), 3000),
  cooldownMs: vctrl(vldFn(z.number().int().min(1000).max(3600000)), 30000),
});

export const wordSchema: Control<PrefWord> = dctrl({
  default: dctrl({
    s2t: dctrl({
      char: isBoolean(true),
      phrase: isBoolean(true),
      zhconvert: isBoolean(false),
    }),
    t2s: dctrl({
      char: isBoolean(true),
      phrase: isBoolean(true),
      zhconvert: isBoolean(false),
    }),
  }),
  custom: dctrl({
    s2t: rctrl(isString),
    t2s: rctrl(isString),
  }),
  zhconvert: zhconvertSchema,
});
