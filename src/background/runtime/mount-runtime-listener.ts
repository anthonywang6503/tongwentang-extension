import { browser } from '../../service/browser';
import type { Runtime } from 'webextension-polyfill';
import type { BgReqAction } from '../../service/runtime/background';
import { handleBgReqAction } from '../../service/runtime/background';
import { detectLanguage } from '../../service/tabs/detect-language';
import { convertClipboard } from '../clipboard';
import { convertPhrase } from '../converter';
import { bgLog } from '../logger';
import { bgGetPref } from '../state/storage';
import { getTargetByAutoConvert } from './handle-get-auto-convert';
import { getTargetByFilter } from './handle-get-filter-target';
import { getTarget } from './handle-get-target';

/**
 * background message handler
 */
export function mountRuntimeListener() {
  browser.runtime.onMessage.addListener(async (message: unknown, sender: Runtime.MessageSender) => {
    const action = message as BgReqAction;
    bgLog('[BG_RECEIVE_REQ] req:', action, 'sender:', sender);

    return bgGetPref().then(async pref => {
      switch (action.type) {
        case 'AutoConvert':
          return handleBgReqAction(action, getTargetByAutoConvert(sender.tab!.id!));
        case 'FilterTarget':
          return handleBgReqAction(action, getTargetByFilter(pref, sender.url!));
        case 'GetTarget':
          return handleBgReqAction(action, getTarget(pref, sender));
        case 'DetectLang':
          return handleBgReqAction(action, detectLanguage(sender.tab!.id));
        case 'NodesText':
          return Promise.all(
            action.payload.texts.map(text => convertPhrase(action.payload.target, text, pref.word)),
          ).then(texts => handleBgReqAction(action, texts));
        case 'Convert':
          return convertPhrase(action.payload.target, action.payload.text, pref.word).then(text =>
            handleBgReqAction(action, text),
          );
        case 'ConvertClipboard':
          return handleBgReqAction(action, convertClipboard(action.payload));
        case 'SpaMode':
          return handleBgReqAction(action, pref.general.spaMode);
        case 'Log':
          bgLog(...action.payload);
          return handleBgReqAction(action, undefined);
      }
    });
  });
}
