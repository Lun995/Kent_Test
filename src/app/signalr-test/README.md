# SignalR 前台連線測試說明

## 概述

這個測試頁面提供完整的 SignalR 客戶端連線測試功能，用於驗證前台與後台 SignalR Hub 的即時通訊。

## 連線流程詳解

### 1. 初始化階段

```typescript
// 建立 HubConnection 實例
const connection = new HubConnectionBuilder()
  .withUrl('https://localhost:7001/signalrhub')
  .withAutomaticReconnect([0, 2000, 10000, 30000]) // 重連策略
  .configureLogging(LogLevel.Information)
  .build()
```

**重連策略說明：**
- `0`: 立即重連
- `2000`: 2秒後重連
- `10000`: 10秒後重連  
- `30000`: 30秒後重連

### 2. 連線階段

```typescript
// 開始連線
await connection.start()
```

**連線過程：**
1. 建立 WebSocket 連線
2. 發送協商請求 (negotiate)
3. 獲取 ConnectionId
4. 建立持久連線

### 3. 事件處理階段

#### 訂閱服務器事件
```typescript
// 訂閱各種事件
connection.on('OrderUpdate', (data) => {
  console.log('收到訂單更新:', data)
})

connection.on('StatusChange', (data) => {
  console.log('收到狀態變更:', data)
})
```

#### 發送事件到服務器
```typescript
// 發送事件
await connection.invoke('SendEvent', eventType, data)
```

### 4. 斷線階段

```typescript
// 斷開連線
await connection.stop()
```

## 測試功能

### 基本測試
1. **連線測試**: 驗證與 SignalR Hub 的連線
2. **事件發送**: 手動發送各種類型的事件
3. **事件接收**: 監聽和顯示接收到的事件
4. **狀態監控**: 即時顯示連線狀態

### 進階測試
1. **自動測試模式**: 每5秒自動發送隨機事件
2. **重連測試**: 模擬網路中斷和恢復
3. **事件記錄**: 保存最近50個事件的詳細記錄
4. **連線日誌**: 完整的連線過程日誌

## 事件類型

| 事件類型 | 描述 | 數據格式 |
|---------|------|----------|
| `order_update` | 訂單更新 | `{orderId, status, ...}` |
| `status_change` | 狀態變更 | `{message, timestamp, ...}` |
| `new_order` | 新訂單 | `{orderId, items, ...}` |
| `order_complete` | 訂單完成 | `{orderId, completionTime, ...}` |

## 連線狀態

| 狀態 | 描述 | 顏色 |
|------|------|------|
| `Connected` | 已連線 | 綠色 |
| `Connecting` | 連線中 | 黃色 |
| `Reconnecting` | 重連中 | 橙色 |
| `Disconnected` | 已斷線 | 紅色 |

## 使用步驟

### 1. 啟動後台服務
```bash
# 啟動 SignalR Hub 服務器
node signalr-server.js
```

### 2. 訪問測試頁面
```
http://localhost:3000/signalr-test
```

### 3. 執行測試
1. 點擊「連線」按鈕建立連線
2. 觀察連線狀態變化
3. 發送測試事件
4. 查看事件記錄和日誌

## 故障排除

### 常見問題

1. **連線失敗**
   - 檢查後台服務是否運行
   - 確認 Hub URL 是否正確
   - 檢查網路連線

2. **事件無法發送**
   - 確認連線狀態為 Connected
   - 檢查事件數據格式
   - 查看瀏覽器控制台錯誤

3. **事件無法接收**
   - 確認已正確訂閱事件
   - 檢查服務器端事件名稱
   - 查看連線日誌

### 調試技巧

1. **開啟瀏覽器開發者工具**
   - 查看 Console 日誌
   - 監控 Network 標籤中的 WebSocket 連線

2. **使用連線日誌**
   - 觀察連線過程的詳細日誌
   - 檢查重連次數和時間

3. **測試不同場景**
   - 正常連線/斷線
   - 網路中斷恢復
   - 服務器重啟

## 技術架構

### 前端組件
- **SignalRClient**: 核心連線管理類
- **測試頁面**: React 組件，提供 UI 介面
- **事件管理**: 事件訂閱、發送、記錄

### 後端服務
- **SignalR Hub**: 處理客戶端連線
- **事件廣播**: 向所有客戶端發送事件
- **連線管理**: 管理客戶端連線狀態

### 數據流
```
客戶端 → WebSocket → SignalR Hub → 事件處理 → 廣播 → 其他客戶端
```

## 擴展功能

### 自定義事件
```typescript
// 添加新的事件類型
connection.on('CustomEvent', (data) => {
  // 處理自定義事件
})
```

### 群組功能
```typescript
// 加入群組
await connection.invoke('JoinGroup', 'kitchen')

// 群組事件
connection.on('GroupMessage', (data) => {
  // 處理群組消息
})
```

### 認證
```typescript
// 添加認證標頭
const connection = new HubConnectionBuilder()
  .withUrl(url, {
    accessTokenFactory: () => getAccessToken()
  })
  .build()
```

## 性能優化

1. **事件節流**: 限制事件發送頻率
2. **連接池**: 管理多個連線
3. **錯誤重試**: 智能重試機制
4. **內存管理**: 及時清理事件監聽器

## 安全考慮

1. **CORS 配置**: 正確設置跨域規則
2. **認證授權**: 實現用戶認證
3. **數據驗證**: 驗證事件數據格式
4. **速率限制**: 防止濫用

## 監控和日誌

### 連線監控
- 連線狀態變化
- 重連次數統計
- 事件發送/接收統計

### 錯誤日誌
- 連線錯誤記錄
- 事件處理錯誤
- 性能問題追蹤

## 總結

這個測試工具提供了完整的 SignalR 連線測試功能，可以幫助開發者：

1. 驗證 SignalR 連線的穩定性
2. 測試各種事件處理場景
3. 監控連線狀態和性能
4. 調試連線問題
5. 開發和測試即時通訊功能

通過這個工具，可以確保前台與後台 SignalR 服務的可靠通訊，為 KDS 系統提供穩定的即時更新功能。 