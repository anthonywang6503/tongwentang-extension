# 建置說明

## 專案

[tongwentang-extension](https://github.com/tongwentang/tongwentang-extension)

## 環境

- Windows、macOS 或 Linux
- Node.js 與 npm

## 安裝依賴

在專案根目錄執行：

```powershell
npm install
```

## 建置與驗證

型別檢查與 Lint：

```powershell
npm run test:tsc
npx eslint .
```

建置 Firefox 與 Chromium 版本：

```powershell
npm run build:all
```

單獨建置可使用 `npm run build:firefox` 或 `npm run build:chromium`。成功後，產物位於 `dist/firefox` 與 `dist/chromium`。
