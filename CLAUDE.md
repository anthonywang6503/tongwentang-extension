# Claude Code 專案指南

完整且具權威性的工作規範位於根目錄 [`AGENTS.md`](AGENTS.md)。開始任何修改前先閱讀該檔案，並以目前 `package.json`、`src/` 與 `docs/` 的內容為準。

## 本專案重點

- 使用 npm scripts：`npm run test:tsc`、`npx eslint .`、`npm run build:all`。
- UI 可見文字要維持 `src/_locales/zh_TW/messages.json` 與 `src/_locales/en/messages.json` 同步。
- 偏好設定的 schema、型別、舊版升級與選項頁面必須一起更新。
- zhconvert 功能遵循網路優先、可設定嘗試／逾時／冷卻、失敗立即本機 failover 的契約；細節以 `AGENTS.md` 與 `docs/preferences/` 為準。
- 功能或設定變更要同步 README、對應文件與必要的實際截圖。
- 建置產物、`node_modules/` 與 `.codebase-memory/` 不提交；未經明確要求不推送。
