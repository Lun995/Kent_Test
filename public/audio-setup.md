# 音效檔案設置說明

## 需要的音效檔案

請將以下音效檔案放在 `public` 資料夾中：

1. **notification.mp3** - 一般通知音效
2. **success.mp3** - 操作成功音效  
3. **error.mp3** - 錯誤提示音效
4. **warning.mp3** - 警告提示音效

## 音效檔案建議規格

- **格式**: MP3 (最佳相容性)
- **長度**: 1-3 秒
- **檔案大小**: < 100KB
- **取樣率**: 44.1kHz
- **位元率**: 128kbps

## 獲取音效檔案的方法

### 1. 免費音效網站
- [Freesound.org](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [SoundBible](http://soundbible.com/)

### 2. 線上音效生成器
- [Online Tone Generator](https://www.szynalski.com/tone-generator/)
- [BeepBox](https://www.beepbox.co/)

### 3. 錄製自己的音效
使用手機或電腦錄製簡短的提示音

## MAUI 相容性說明

✅ **WebView 中的 HTML5 Audio API 可以正常使用**
- MAUI 的 WebView 支援 HTML5 Audio API
- 音效播放功能在 MAUI 應用程式中可以正常運作

✅ **音效檔案需要放在 public 資料夾**
- 確保音效檔案在部署時會被包含在應用程式中

✅ **建議使用 MP3 格式**
- MP3 格式在各種平台都有良好的支援
- 檔案大小較小，載入速度快

⚠️ **注意事項**
- 某些瀏覽器需要用戶互動才能播放音效
- 建議在用戶點擊按鈕時播放音效
- 音效檔案過大會影響應用程式載入速度

## 測試步驟

1. 將音效檔案放入 `public` 資料夾
2. 啟動開發伺服器：`npm run dev`
3. 點擊左側的「🔊音效測試」按鈕
4. 測試各種音效是否正常播放
5. 確認在 MAUI 應用程式中也能正常播放

## 故障排除

### 音效無法播放
- 檢查檔案路徑是否正確
- 確認檔案格式為 MP3
- 檢查瀏覽器控制台是否有錯誤訊息

### 音效播放延遲
- 檢查檔案大小是否過大
- 考慮使用較小的音效檔案
- 確保音效檔案已預載入

### MAUI 中音效無法播放
- 確認音效檔案已包含在應用程式包中
- 檢查 WebView 設定是否允許音效播放
- 確認設備音量設定 