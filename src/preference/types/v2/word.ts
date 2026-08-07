import type { DicObj, LangType } from 'tongwen-core/dictionaries';

export interface PrefWordItem {
  name: string;
  url: string;
  enabled: boolean;
  type: LangType;
  map: DicObj;
}

export type ZhconvertConverter =
  | 'Simplified'
  | 'Traditional'
  | 'China'
  | 'Hongkong'
  | 'Taiwan'
  | 'Pinyin'
  | 'Bopomofo'
  | 'Mars'
  | 'WikiSimplified'
  | 'WikiTraditional';

export type PrefWordDefault = Record<LangType, Record<'char' | 'phrase' | 'zhconvert', boolean>>;

export type PrefWordCustom = Record<LangType, Record<string, string>>;

export interface PrefZhconvert {
  apiUrl: string;
  apiKey: string;
  s2tConverter: ZhconvertConverter;
  t2sConverter: ZhconvertConverter;
  tryCount: number;
  timeoutMs: number;
  cooldownMs: number;
  concurrency: number;
}

export interface PrefWord {
  default: PrefWordDefault;
  custom: PrefWordCustom;
  zhconvert: PrefZhconvert;
}
