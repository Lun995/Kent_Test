# 環境設定說明

## 後端 API 配置

### 1. 創建環境變數檔案

在專案根目錄創建 `.env.local` 檔案（此檔案不會被 Git 追蹤）：

```bash
# 後端 API 基礎 URL (本地開發環境)
BACKEND_API_URL=http://localhost:5000

# API 超時設定 (毫秒)
API_TIMEOUT=30000

# API 重試次數
API_RETRY_ATTEMPTS=3

# API 快取啟用
API_CACHE_ENABLED=true

# 環境設定
NODE_ENV=development
```

### 2. 重要注意事項

- **檔案名稱**: 使用 `.env.local` 而不是 `.env`，因為 `.env.local` 不會被 Git 追蹤
- **API URL**: 設定為 `https://localhost:5001`（您的本地後端服務）
- **HTTPS**: 注意使用 `https://` 而不是 `http://`，因為您的後端使用 HTTPS

### 3. 驗證設定

設定完成後，您可以：

1. 重新啟動 Next.js 開發伺服器
2. 檢查瀏覽器開發者工具的 Network 標籤
3. 確認 API 請求是否指向正確的 URL

### 4. 生產環境設定

在 Vercel 或其他部署平台，設定相同的環境變數：

```bash
BACKEND_API_URL=https://your-production-api.com
NODE_ENV=production
```

### 5. 故障排除

如果 API 呼叫失敗：

1. 確認後端服務是否在 `https://localhost:5001` 運行
2. 檢查瀏覽器控制台的錯誤訊息
3. 確認環境變數檔案是否正確載入
4. 重新啟動開發伺服器

## 當前配置狀態

- ✅ API Client 已配置為使用 `BACKEND_API_URL` 環境變數
- ✅ 工作站服務已設定為使用相對路徑 `/api/kds/workstations`
- ✅ 完整的 API 架構已實作完成
- ✅ 環境變數配置說明已更新

## 下一步

設定完成後，您的應用程式將：
1. 從 `https://localhost:5001/api/kds/workstations` 獲取工作站資料
2. 使用配置的超時和重試設定
3. 啟用快取機制提升效能
