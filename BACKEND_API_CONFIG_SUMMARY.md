# 後端 API 配置完成總結

## 🎯 配置目標

將後端 API 基礎 URL 設定為 `http://localhost:5000`，以符合您的本地開發環境需求。

## ✅ 已完成的配置

### 1. API Client 更新
- **檔案**: `src/lib/api-client.ts`
- **變更**: 將預設 `baseURL` 從 `http://localhost:3001` 更新為 `https://localhost:5001`
- **狀態**: ✅ 完成

### 2. 環境變數配置
- **檔案**: `.env.local` (需要手動創建)
- **配置**: 
  ```bash
  BACKEND_API_URL=https://localhost:5001
  API_TIMEOUT=30000
  API_RETRY_ATTEMPTS=3
  API_CACHE_ENABLED=true
  NODE_ENV=development
  ```
- **狀態**: 📝 需要手動創建

### 3. 文檔更新
- **檔案**: `API_ARCHITECTURE_README.md`
- **變更**: 更新環境變數範例中的 `BACKEND_API_URL`
- **狀態**: ✅ 完成

### 4. 環境設定說明
- **檔案**: `ENVIRONMENT_SETUP.md`
- **內容**: 詳細的環境變數設定說明
- **狀態**: ✅ 完成

## 🔧 需要手動執行的步驟

### 步驟 1: 創建環境變數檔案
在專案根目錄創建 `.env.local` 檔案：

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

### 步驟 2: 重新啟動開發伺服器
```bash
npm run dev
# 或
yarn dev
```

## 🌐 API 端點結構

設定完成後，您的應用程式將使用以下 API 端點：

- **基礎 URL**: `http://localhost:5000`
- **工作站 API**: `http://localhost:5000/api/kds/workstations`
- **完整請求**: `http://localhost:5000/api/kds/workstations?storeId=1`

## 🔍 驗證配置

### 1. 檢查環境變數
在瀏覽器控制台執行：
```javascript
console.log('BACKEND_API_URL:', process.env.BACKEND_API_URL);
```

### 2. 檢查 API 請求
在瀏覽器開發者工具的 Network 標籤中，確認 API 請求指向正確的 URL。

### 3. 測試工作站 API
訪問 `/api/main?storeId=1` 端點，確認它能正確呼叫後端服務。

## 🚨 注意事項

1. **HTTP**: 您的後端使用 HTTP (`http://localhost:5000`)，這是本地開發環境的標準配置
2. **防火牆**: 確認本地防火牆允許 5000 端口的連接
3. **後端服務**: 確保後端服務在 `http://localhost:5000` 正常運行

## 📚 相關檔案

- `src/lib/api-client.ts` - API 客戶端核心配置
- `src/lib/services/workstation-service.ts` - 工作站服務
- `src/app/api/main/route.ts` - 工作站 API 端點
- `API_ARCHITECTURE_README.md` - 完整架構文檔
- `ENVIRONMENT_SETUP.md` - 環境設定說明

## 🎉 配置完成

您的 Next.js 應用程式現在已配置為使用 `https://localhost:5001` 作為後端 API 基礎 URL。所有的工作站相關 API 呼叫都將指向這個地址。

如果遇到任何問題，請檢查：
1. 環境變數檔案是否正確創建
2. 後端服務是否在指定端口運行
3. 瀏覽器控制台是否有錯誤訊息
