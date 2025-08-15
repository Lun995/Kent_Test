# Vercel 部署說明

## 部署前準備

### 1. 環境變數設置
在 Vercel 專案設置中添加以下環境變數：

```bash
# 資料庫配置
DATABASE_URL=your_database_connection_string
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# API配置
API_BASE_URL=https://your-domain.vercel.app/api
NEXT_PUBLIC_API_BASE_URL=https://your-domain.vercel.app/api

# 應用配置
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=KDS System
```

### 2. 資料庫連接
確保您的資料庫可以從 Vercel 的伺服器位置訪問。

## 部署步驟

### 1. 連接 GitHub 倉庫
1. 登入 [Vercel](https://vercel.com)
2. 點擊 "New Project"
3. 選擇您的 GitHub 倉庫
4. 配置專案設置

### 2. 構建設置
- **Framework Preset**: Next.js
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. 環境變數
在 Vercel 專案設置中添加上述環境變數。

### 4. 部署
點擊 "Deploy" 開始部署。

## 常見問題

### 1. 構建失敗
- 檢查 TypeScript 錯誤
- 確保所有依賴都已安裝
- 檢查環境變數設置

### 2. 運行時錯誤
- 檢查資料庫連接
- 確認 API 路由配置
- 查看 Vercel 函數日誌

### 3. 環境變數問題
- 確保所有必要的環境變數都已設置
- 檢查變數名稱拼寫
- 確認變數值格式正確

## 維護

### 1. 自動部署
每次推送到主分支都會自動觸發部署。

### 2. 手動部署
可以在 Vercel 控制台手動觸發部署。

### 3. 回滾
如果部署失敗，可以快速回滾到之前的版本。
