# PWA (Progressive Web App) 設定說明

## 功能特色

✅ **可安裝到主畫面** - 支援Android、iOS、Windows等平台
✅ **離線使用** - Service Worker提供快取功能
✅ **原生APP體驗** - 全螢幕顯示，無瀏覽器UI
✅ **自動更新** - 新版本自動檢測和更新
✅ **網路狀態監控** - 顯示離線/連線狀態

## 已設定的檔案

### 核心檔案
- `public/manifest.json` - PWA配置檔
- `public/sw.js` - Service Worker
- `src/hooks/usePWA.ts` - PWA功能Hook
- `src/components/PWAInstallPrompt.tsx` - 安裝提示組件

### 圖標檔案
- `public/icon-16x16.svg` - 16x16圖標
- `public/icon-32x32.svg` - 32x32圖標
- `public/icon-192x192.svg` - 192x192圖標 (Android)
- `public/icon-512x512.svg` - 512x512圖標 (Android)
- `public/apple-touch-icon.svg` - 180x180圖標 (iOS)
- `public/safari-pinned-tab.svg` - Safari標籤圖標

### 配置文件
- `next.config.js` - Next.js PWA配置
- `public/browserconfig.xml` - Windows磁貼配置

## 使用方法

### 1. 開發環境
```bash
npm run dev
```

### 2. 生產環境建置
```bash
npm run build
npm start
```

### 3. 安裝到主畫面
- **Android**: 瀏覽器選單 → "新增到主畫面"
- **iOS**: Safari分享按鈕 → "新增到主畫面"
- **Windows**: Edge瀏覽器 → "安裝此網站作為應用程式"

## 自訂設定

### 修改應用名稱
編輯 `public/manifest.json`:
```json
{
  "name": "你的應用名稱",
  "short_name": "簡短名稱"
}
```

### 修改主題色
編輯 `public/manifest.json` 和 `src/app/layout.tsx`:
```json
{
  "theme_color": "#你的顏色代碼"
}
```

### 修改圖標
1. 準備PNG格式圖標 (建議尺寸: 192x192, 512x512)
2. 替換 `public/` 目錄下的對應檔案
3. 更新 `manifest.json` 中的圖標路徑

## 測試PWA功能

### 1. 開發者工具
- 開啟Chrome DevTools
- 前往 Application 標籤
- 檢查 Manifest 和 Service Workers

### 2. Lighthouse審計
- 安裝Lighthouse擴充功能
- 執行PWA審計
- 檢查分數和建議

### 3. 離線測試
- 開啟網站
- 斷開網路連線
- 重新整理頁面，應該仍能正常顯示

## 注意事項

⚠️ **開發環境**: PWA功能在開發模式下會被停用
⚠️ **HTTPS**: 生產環境必須使用HTTPS
⚠️ **圖標格式**: 建議使用PNG格式以獲得最佳相容性
⚠️ **快取策略**: 可根據需求調整Service Worker的快取策略

## 故障排除

### 安裝提示不顯示
- 檢查瀏覽器是否支援PWA
- 確認manifest.json格式正確
- 檢查Service Worker是否成功註冊

### 圖標不顯示
- 確認圖標檔案路徑正確
- 檢查圖標檔案格式和尺寸
- 清除瀏覽器快取

### 離線功能異常
- 檢查Service Worker註冊狀態
- 確認快取策略設定
- 檢查網路請求處理邏輯
