# SignalR 測試專案

這個專案包含前端 React 測試頁面和後端 C# SignalR Hub 服務。

## 檔案結構

### 前端檔案
- `src/app/signalr-test-page/page.tsx` - SignalR 測試頁面
- 訪問路徑: `http://localhost:3000/signalr-test-page`

### 後端檔案
- `SignalR-Hub-Example.cs` - SignalR Hub 實作
- `Program.cs` - 應用程式入口點
- `SignalRTest.csproj` - 專案設定檔

## 啟動步驟

### 1. 啟動前端服務
```bash
npm run dev
```
前端服務會在 `http://localhost:3000` 啟動

### 2. 啟動後端 SignalR Hub
```bash
# 在後端專案目錄中
dotnet run
```
後端服務會在 `https://localhost:7001` 啟動

### 3. 測試連線
1. 開啟瀏覽器訪問 `http://localhost:3000/signalr-test-page`
2. 在 Hub URL 欄位輸入: `https://localhost:7001/signalrhub`
3. 點擊「連線到 Hub」按鈕
4. 測試各種功能

## 功能說明

### 前端功能
- **連線管理**: 連線/斷線到 SignalR Hub
- **聊天室**: 加入/離開聊天室，發送訊息
- **通知系統**: 發送通知給所有用戶
- **廣播功能**: 發送廣播訊息
- **訊息記錄**: 即時顯示所有訊息
- **連線狀態**: 顯示連線 ID 和統計資訊

### 後端 Hub 方法
- `JoinChat(string userName)` - 加入聊天室
- `LeaveChat(string userName)` - 離開聊天室
- `SendMessage(string userName, string message)` - 發送訊息
- `SendNotification(string message)` - 發送通知
- `BroadcastMessage(string message)` - 廣播訊息
- `GetOnlineUsers()` - 取得線上用戶列表
- `SendPrivateMessage(string targetUserName, string message)` - 發送私人訊息
- `TestConnection()` - 測試連線

### 後端事件
- `ReceiveMessage(string user, string message)` - 接收訊息
- `UserJoined(string user)` - 用戶加入
- `UserLeft(string user)` - 用戶離開
- `ReceiveNotification(string message)` - 接收通知
- `ReceiveOnlineUsers(List<string> users)` - 接收線上用戶列表
- `ReceivePrivateMessage(string sender, string message)` - 接收私人訊息

## 測試建議

1. **基本連線測試**
   - 開啟多個瀏覽器分頁
   - 每個分頁使用不同用戶名稱
   - 測試連線和斷線功能

2. **聊天室測試**
   - 多個用戶同時加入聊天室
   - 發送訊息測試即時通訊
   - 測試用戶離開功能

3. **通知測試**
   - 測試通知功能
   - 驗證通知計數器

4. **廣播測試**
   - 測試廣播訊息功能
   - 驗證所有用戶都能收到

## 故障排除

### 常見問題
1. **CORS 錯誤**: 確保後端 CORS 設定正確
2. **連線失敗**: 檢查 Hub URL 是否正確
3. **SSL 憑證錯誤**: 在開發環境中可能需要忽略 SSL 驗證

### 除錯技巧
- 開啟瀏覽器開發者工具查看 Console 訊息
- 檢查後端 Console 輸出
- 使用 Network 標籤檢查 WebSocket 連線狀態

## 進階功能

可以根據需求擴展以下功能：
- 群組聊天室
- 檔案傳輸
- 語音/視訊通話
- 訊息持久化
- 用戶認證
- 訊息加密 