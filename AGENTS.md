# 專案代理人指引

## 專案定位

本專案是新同文堂瀏覽器擴充功能，使用 TypeScript、React、Rspack 與 WebExtension API，支援 Firefox 與 Chromium 系列瀏覽器。`src/` 是唯一的程式碼來源；`dist/` 是建置產物，不是修改目標。

## 開始工作前

1. 閱讀 `README.md` 了解功能、建置與文件入口。
2. 依工作範圍閱讀 `docs/preferences/`、`docs/permission/` 或 `docs/build/` 的對應文件。
3. 先檢查 `git status --short`，保留使用者既有修改，只處理本次需求相關檔案。
4. 以 `package.json` 的 scripts 為建置與驗證命令來源，不以過時的 Yarn 命令取代 npm 命令。

## 常用命令

```powershell
npm install
npm run test:tsc
npx eslint .
npm run build:all
```

開發模式：

```powershell
npm run dev:firefox
npm run dev:chromium
```

Chromium 開發前，複製 `.env.example` 為 `.env`，並設定 `CHROMIUM_BINARY`。正式建置輸出在 `dist/firefox` 與 `dist/chromium`。

## 程式碼與 UI 慣例

- TypeScript 與 React 元件維持既有格式；只做能直接追溯到需求的精確修改。
- 所有產品控制字串使用 `src/_locales/` 的 i18n 訊息；修改台灣繁體中文時，同步檢查 `src/_locales/en/messages.json`。
- 偏好設定的預設值與驗證放在 `src/preference/schema/v2/`，型別放在 `src/preference/types/v2/`，舊版升級需同步保留新欄位。
- 背景流程位於 `src/background/`；不要在選項頁面直接實作轉換或網路請求。
- 不手動修改 `dist/`、`node_modules/` 或由建置產生的檔案。

## zhconvert 功能契約

zhconvert 功能位於 `src/background/zhconvert/`，設定頁位於 `src/options/pages/word/WordDefaultSettings.tsx`。

- 啟用的是「詞彙 → 預設」中的方向開關，簡轉正與正轉簡分開控制。
- 網路轉換採網路優先；每次請求依 `tryCount` 嘗試，單次請求受 `timeoutMs` 限制。
- 全部嘗試失敗後立即使用原有本機詞彙轉換，並以低干擾通知告知使用者。
- 失敗後至 `cooldownMs` 到期前不發出新的網路請求；冷卻結束後才恢復嘗試。
- 設定包含 `apiUrl`、`apiKey`、雙向 converter、`tryCount`、`timeoutMs` 與 `cooldownMs`，預設值與範圍必須和 schema、UI、文件一致。
- `NodesText` 與一般 `Convert` 走 zhconvert failover 流程；剪貼簿轉換維持既有本機流程。
- API 請求使用 zhconvert `/convert` 規格，並保留產品頁面的 API 授權與商業使用提示。
- 因 `apiUrl` 可自訂，`manifest.js` 的 `<all_urls>` host permission 是目前設計的一部分；若要縮小授權範圍，必須同步改變 API URL 契約與文件，不可只改 manifest。

## 文件同步

涉及功能、設定、權限、建置或依賴時，檢查並同步：

- `README.md`
- `docs/preferences/preferences_zh-tw.md` 與 `docs/preferences/preferences.md`
- `docs/permission/permission_zh-tw.md` 與 `docs/permission/permission.md`
- `docs/build/readme.md`
- `CHANGELOG.md`（若需求要求記錄變更）
- `docs/images/` 中的實際 UI 截圖（若功能有可視化設定）

README 與台灣繁體中文文件使用相對路徑連結；截圖必須放在儲存庫內並確認 Markdown 連結可解析。文件不可描述尚未實作的設定或行為。

## 提交與交付

- 提交前只 stage 本次需求檔案，先檢查 `git diff --cached --check` 與 staged 檔案清單。
- 使用清楚的 Conventional Commit 訊息；除非使用者明確要求，不要推送或建立 PR。
- `.codebase-memory/` 是本機索引工具產物，不納入提交。
- 完成前至少通過型別檢查、Lint、與受影響瀏覽器的 production build；若有未解決警告，明確記錄警告內容。
