# API 環境配置說明

## 概述

本專案支援多環境 API 配置，可以根據環境變數動態切換 API 來源。

## 環境類型

- **local**: 本地開發環境 (預設)
- **dev**: 測試環境
- **prod**: 正式環境

## 設定方式

### 1. 建立環境變數檔案

在專案根目錄建立 `.env.local` 檔案：

```bash
# 環境配置
NEXT_PUBLIC_API_ENV=local

# 本地 API 配置
NEXT_PUBLIC_LOCAL_API_BASE_URL=http://localhost:5000

# 測試環境 API 配置
NEXT_PUBLIC_DEV_API_BASE_URL=https://dev-api.example.com

# 正式環境 API 配置
NEXT_PUBLIC_PROD_API_BASE_URL=https://api.example.com
```

### 2. 切換環境

修改 `.env.local` 中的 `NEXT_PUBLIC_API_ENV` 值：

```bash
# 切換到本地環境
NEXT_PUBLIC_API_ENV=local

# 切換到測試環境
NEXT_PUBLIC_API_ENV=dev

# 切換到正式環境
NEXT_PUBLIC_API_ENV=prod
```

修改後需要重新啟動開發伺服器：

```bash
npm run dev
```

## 使用方式

### 在組件中使用

```typescript
import { getApiConfig, buildApiUrl, getCurrentEnvironment } from '../lib/api-config';

// 獲取當前環境配置
const config = getApiConfig();
console.log('當前環境:', config.environment);
console.log('API 基礎 URL:', config.baseUrl);

// 建構 API URL
const workstationUrl = buildApiUrl('/api/Kds/GetKdsWorkStationList?storeId=504');

// 檢查當前環境
if (getCurrentEnvironment() === 'local') {
  console.log('目前使用本地環境');
}
```

### 在 Hook 中使用

```typescript
import { getWorkstationListUrl } from '../lib/api-config';

const fetchWorkstations = async (storeId: number) => {
  const apiUrl = getWorkstationListUrl(storeId);
  const response = await fetch(apiUrl);
  // ...
};
```

## 環境切換器

在開發環境中，頁面右上角會顯示環境切換器，可以快速查看當前環境狀態。

## API 端點對應

| 環境 | 基礎 URL | 工作站清單 API |
|------|----------|----------------|
| local | http://localhost:5000 | http://localhost:5000/api/Kds/GetKdsWorkStationList |
| dev | https://dev-api.example.com | https://dev-api.example.com/api/Kds/GetKdsWorkStationList |
| prod | https://api.example.com | https://api.example.com/api/Kds/GetKdsWorkStationList |

## 注意事項

1. 環境變數必須以 `NEXT_PUBLIC_` 開頭才能在客戶端使用
2. 修改環境變數後需要重新啟動開發伺服器
3. 測試環境和正式環境的 URL 需要根據實際情況設定
4. 環境切換器僅在開發環境中顯示

## 擴展

如需新增其他 API 端點，可以在 `api-config.ts` 中新增對應的函數：

```typescript
export function getOrderListUrl(storeId: number): string {
  return buildApiUrl(`/api/Orders/GetOrderList?storeId=${storeId}`);
}
```
