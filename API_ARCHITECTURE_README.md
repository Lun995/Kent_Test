# Next.js API 架構設計說明

## 概述

本專案採用現代化的 API 架構設計，遵循業界最佳實踐，提供可擴展、可維護、高效能的 API 服務層。

## 架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                      │
│  (React Components, Pages, Layouts)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Custom Hooks                            │
│  (useWorkstation, useApi, useOptimisticApi)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Service Layer                           │
│  (WorkstationService, BaseService)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    API Client                              │
│  (ApiClient with interceptors, caching, retry)             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Next.js API Routes                      │
│  (src/app/api/*/route.ts)                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    External APIs                           │
│  (Backend Services, Third-party APIs)                      │
└─────────────────────────────────────────────────────────────┘
```

## 核心組件

### 1. API 客戶端 (`src/lib/api-client.ts`)

**功能特性：**
- 統一的 HTTP 請求處理
- 請求/回應攔截器
- 自動重試機制
- 智能快取管理
- 錯誤處理和日誌記錄
- 超時控制
- 認證 Token 管理

**使用方式：**
```typescript
import { apiClient } from '@/lib/api-client';

// 設定認證 Token
apiClient.setToken('your-jwt-token');

// 發送請求
const response = await apiClient.get('/api/endpoint');
const data = await apiClient.post('/api/endpoint', { key: 'value' });

// 帶重試的請求
const result = await apiClient.requestWithRetry({
  url: '/api/endpoint',
  method: 'GET',
  retries: 3,
  timeout: 10000,
});
```

### 2. 基礎服務類別 (`src/lib/base-service.ts`)

**功能特性：**
- 通用的 CRUD 操作
- 分頁支援
- 快取管理
- 資料驗證
- 錯誤處理

**使用方式：**
```typescript
import { BaseService } from '@/lib/base-service';

class MyService extends BaseService<MyType> {
  constructor() {
    super(apiClient, {
      endpoint: '/api/my-endpoint',
      enableCache: true,
      cacheTTL: 5 * 60 * 1000,
    });
  }
  
  // 自定義業務邏輯
  async customMethod() {
    return this.apiClient.get('/api/custom');
  }
}
```

### 3. 工作站服務 (`src/lib/services/workstation-service.ts`)

**功能特性：**
- 工作站 CRUD 操作
- 狀態管理
- 批量操作
- 統計資訊
- 搜尋功能
- 快取優化

**使用方式：**
```typescript
import { workstationService } from '@/lib/services/workstation-service';

// 獲取工作站清單
const workstations = await workstationService.getWorkstationsByStore(1);

// 更新工作站狀態
await workstationService.updateWorkstationStatus(123, { isOn: 0 });

// 獲取統計資訊
const stats = await workstationService.getWorkstationStats(1);
```

### 4. 自定義 Hooks (`src/hooks/useApi.ts`)

**功能特性：**
- 資料獲取狀態管理
- 自動重新獲取
- 快取整合
- 錯誤處理
- 樂觀更新
- 無限滾動

**使用方式：**
```typescript
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const { data, loading, error, refetch } = useApi(
    () => fetchData(),
    {
      cacheKey: 'my-data',
      autoRefresh: true,
      refreshInterval: 30000,
    }
  );
  
  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;
  
  return <div>{/* 渲染資料 */}</div>;
}
```

### 5. 工作站專用 Hooks (`src/hooks/useWorkstation.ts`)

**功能特性：**
- 工作站資料管理
- 狀態更新
- 批量操作
- 快取管理
- 選擇管理
- 過濾和排序

**使用方式：**
```typescript
import { useWorkstations, useWorkstationStatusUpdate } from '@/hooks/useWorkstation';

function WorkstationList() {
  const { data: workstations, loading } = useWorkstations(1);
  const { updateStatus } = useWorkstationStatusUpdate();
  
  const handleToggleStatus = async (uid: number) => {
    await updateStatus(uid, { isOn: 0 });
  };
  
  return (
    <div>
      {workstations?.map(ws => (
        <div key={ws.uid}>
          {ws.name}
          <button onClick={() => handleToggleStatus(ws.uid)}>
            停用
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 類型定義 (`src/types/api.ts`)

**包含的類型：**
- 基礎 API 回應格式
- 分頁相關類型
- 錯誤代碼枚舉
- 工作站相關介面
- 訂單相關介面
- 用戶相關介面
- 通用工具類型

**使用方式：**
```typescript
import { 
  ApiResponse, 
  KdsWorkstation, 
  ApiErrorCode 
} from '@/types/api';

// 使用類型
const response: ApiResponse<KdsWorkstation[]> = await fetchData();

if (response.code === ApiErrorCode.SUCCESS) {
  // 處理成功回應
  const workstations = response.data;
}
```

## 配置管理

### 環境變數

創建 `.env.local` 文件：

```bash
# API 配置
BACKEND_API_URL=http://localhost:5000
API_TOKEN=your_jwt_token_here
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
API_CACHE_ENABLED=true

# 應用程式配置
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 認證配置
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=86400
```

### 快取配置

```typescript
// 在服務類別中配置快取
const service = new MyService({
  enableCache: true,
  cacheTTL: 5 * 60 * 1000, // 5分鐘
  defaultLimit: 20,
});
```

## 最佳實踐

### 1. 錯誤處理

```typescript
try {
  const response = await apiClient.get('/api/endpoint');
  return response;
} catch (error) {
  if (error instanceof ApiError) {
    // 處理 API 錯誤
    console.error(`API Error: ${error.message}`);
    throw error;
  }
  
  // 處理其他錯誤
  console.error('Unexpected error:', error);
  throw new Error('未知錯誤');
}
```

### 2. 快取策略

```typescript
// 使用適當的快取鍵值
const cacheKey = `workstations:${storeId}:${JSON.stringify(params)}`;

// 設定合理的快取過期時間
const cacheTTL = 2 * 60 * 1000; // 2分鐘（工作站資料變化較頻繁）
```

### 3. 重試機制

```typescript
// 配置重試參數
const response = await apiClient.requestWithRetry({
  url: '/api/endpoint',
  method: 'GET',
  retries: 3,
  timeout: 10000,
});
```

### 4. 監控和日誌

```typescript
// 添加請求攔截器記錄 API 呼叫
apiClient.addRequestInterceptor((config) => {
  console.log(`API Call: ${config.method} ${config.url}`);
  return config;
});

// 添加回應攔截器記錄統計
apiClient.addResponseInterceptor(async (response, config) => {
  console.log(`API Response: ${config.method} ${config.url} - ${response.status}`);
  return response;
});
```

## 擴展指南

### 1. 添加新的服務

```typescript
// 1. 創建服務類別
class OrderService extends BaseService<Order> {
  constructor() {
    super(apiClient, {
      endpoint: '/api/orders',
      enableCache: true,
      cacheTTL: 1 * 60 * 1000,
    });
  }
  
  // 2. 添加業務邏輯
  async getOrdersByStatus(status: OrderStatus) {
    return this.findByCondition({ status });
  }
}

// 3. 創建服務實例
export const orderService = new OrderService();
```

### 2. 添加新的 Hook

```typescript
// 1. 創建專用 Hook
export function useOrders(storeId: number) {
  const fetcher = useCallback(async () => {
    return orderService.getOrdersByStore(storeId);
  }, [storeId]);
  
  return useApi(fetcher, {
    cacheKey: `orders:${storeId}`,
    autoRefresh: true,
    refreshInterval: 60 * 1000,
  });
}
```

### 3. 添加新的 API 路由

```typescript
// 1. 創建 API 路由
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    if (!storeId) {
      return NextResponse.json({
        message: '缺少必要參數: storeId',
        code: ApiErrorCode.VALIDATION_ERROR,
        data: null
      }, { status: 400 });
    }
    
    const response = await orderService.getOrdersByStore(parseInt(storeId));
    return NextResponse.json(response);
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

## 效能優化

### 1. 快取策略

- **API 層快取**：減少重複的網路請求
- **組件層快取**：避免不必要的重新渲染
- **資料層快取**：優化資料庫查詢

### 2. 請求優化

- **請求合併**：將多個小請求合併為一個大請求
- **延遲載入**：按需載入資料
- **預載入**：預測用戶行為提前載入資料

### 3. 錯誤處理

- **智能重試**：根據錯誤類型決定是否重試
- **降級策略**：當主要服務不可用時提供備用方案
- **用戶友好的錯誤訊息**：提供清晰的錯誤說明

## 測試策略

### 1. 單元測試

```typescript
// 測試服務類別
describe('WorkstationService', () => {
  it('should get workstations by store', async () => {
    const service = new WorkstationService();
    const result = await service.getWorkstationsByStore(1);
    
    expect(result.code).toBe('0000');
    expect(Array.isArray(result.data)).toBe(true);
  });
});
```

### 2. 整合測試

```typescript
// 測試 API 路由
describe('Workstation API', () => {
  it('should return 400 for missing storeId', async () => {
    const request = new NextRequest('http://localhost/api/main');
    const response = await GET(request);
    
    expect(response.status).toBe(400);
  });
});
```

### 3. E2E 測試

```typescript
// 測試完整的工作流程
describe('Workstation Workflow', () => {
  it('should create, update, and delete workstation', async () => {
    // 創建工作站
    // 更新工作站
    // 刪除工作站
    // 驗證結果
  });
});
```

## 部署和監控

### 1. 環境配置

- **開發環境**：使用本地 API 和快取
- **測試環境**：使用測試資料庫和模擬服務
- **生產環境**：使用生產 API 和 CDN 快取

### 2. 效能監控

- **API 回應時間**：監控 API 效能
- **錯誤率**：追蹤 API 錯誤
- **快取命中率**：優化快取策略
- **用戶體驗指標**：監控前端效能

### 3. 日誌和追蹤

- **結構化日誌**：使用 JSON 格式記錄日誌
- **請求追蹤**：使用唯一 ID 追蹤請求
- **效能分析**：記錄關鍵操作的執行時間

## 總結

這個 API 架構設計提供了：

1. **可維護性**：清晰的層次結構和職責分離
2. **可擴展性**：易於添加新功能和服務
3. **效能**：智能快取和優化策略
4. **可靠性**：完善的錯誤處理和重試機制
5. **開發體驗**：豐富的 Hook 和工具函數
6. **類型安全**：完整的 TypeScript 支援

通過遵循這個架構，開發者可以快速構建高品質的 API 服務，同時保持程式碼的可讀性和可維護性。
