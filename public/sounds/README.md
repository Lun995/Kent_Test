# 音頻文件目錄

這個目錄包含用於 iOS 通知測試的音頻文件。

## 📁 文件結構

```
public/sounds/
├── README.md
├── notification.mp3      # 通知音效
├── glass.mp3           # iOS Glass 音效
├── blow.mp3            # iOS Blow 音效
├── new.mp3             # iOS New 音效
└── custom.mp3          # 自定義通知音效
```

## 🎵 音頻文件說明

### notification.mp3
- **用途**: 標準通知音效
- **格式**: MP3
- **時長**: 約 0.5 秒
- **描述**: 模擬 iOS 系統通知音效

### glass.mp3
- **用途**: iOS Glass 系統音效
- **格式**: MP3
- **時長**: 約 0.3 秒
- **描述**: 模擬 iOS Glass 音效

### blow.mp3
- **用途**: iOS Blow 系統音效
- **格式**: MP3
- **時長**: 約 0.4 秒
- **描述**: 模擬 iOS Blow 音效

### new.mp3
- **用途**: iOS New 系統音效
- **格式**: MP3
- **時長**: 約 0.3 秒
- **描述**: 模擬 iOS New 音效

### custom.mp3
- **用途**: 自定義通知音效
- **格式**: MP3
- **時長**: 約 1 秒
- **描述**: 可自定義的通知音效

## 🔧 使用方式

### 1. 在 JavaScript 中播放
```javascript
const audio = new Audio('/sounds/notification.mp3');
audio.volume = 0.8;
audio.play();
```

### 2. 在 React 組件中使用
```javascript
const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.8;
  audio.play().catch(error => {
    console.log('音頻播放失敗:', error);
  });
};
```

### 3. 在 MAUI WebView 中使用
```javascript
// 在 WebView 中播放通知聲音
function playNotificationInWebView() {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.8;
  audio.play();
}
```

## 📝 注意事項

1. **文件格式**: 建議使用 MP3 格式，兼容性最好
2. **文件大小**: 音頻文件應盡量小於 100KB
3. **音頻品質**: 建議使用 44.1kHz 採樣率
4. **音量控制**: 在代碼中設置適當的音量級別
5. **錯誤處理**: 添加音頻播放失敗的錯誤處理

## 🎯 測試建議

1. **音量測試**: 在不同音量級別下測試音頻播放
2. **靜音測試**: 在設備靜音模式下測試行為
3. **背景測試**: 在應用程式背景運行時測試
4. **多音頻測試**: 同時播放多個音頻文件
5. **網路測試**: 在網路不穩定環境下測試

## 🔗 相關文件

- `ios-notification-test/page.tsx`: iOS 通知測試頁面
- `ios-browser-test.js`: iOS 環境模擬測試腳本
- `ios-simulator-test-guide.md`: iOS 模擬器測試指南 