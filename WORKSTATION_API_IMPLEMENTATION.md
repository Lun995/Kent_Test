# KDS 工作站 API 實現說明

## 概述
本次修改將原本寫死在工作站按鈕清單中的工作站資料，改為通過 KDS 工作站 API 動態獲取，實現了資料的動態化和可配置性。API 完全符合 A01-GET-KDS工作站 的規格要求。

## 修改內容

### 1. API 端點 (`src/app/api/main/route.ts`)
- 新增了 `GET` 方法來獲取 KDS 工作站清單
- 參數：`storeId` (必要，整數類型，店代碼)
- 返回完整的工作站資料，包含所有 KDS 相關欄位
- 實現了完整的參數驗證和錯誤處理
- 符合 A01-GET-KDS工作站 API 規格

#### API 規格
```
GET /api/main?storeId={storeId}

參數：
- storeId: 必要，整數，店代碼

回應格式：
{
  "message": string,
  "code": string,        // "0000": 成功, "9999": 失敗
  "data": [
    {
      "uid": number,     // 唯一識別碼
      "no": string,      // 編號
      "name": string,    // 名稱
      "brandId": number, // 品牌ID
      "storeId": number, // 門店ID
      "isOn": number,    // 是否啟用 (1: 啟用, 0: 停用)
      "serialNo": number, // 排序序號
      "memo": string,    // 備註
      "creatorId": number, // 建立者ID
      "createDate": string, // 建立時間
      "modifyId": number,   // 修改者ID
      "modifyDate": string, // 修改時間
      "isDisabled": number, // 是否停用
      "status": number,     // 狀態
      "companyId": number,  // 公司ID
      "isDefault": number,  // 是否預設工作站
      "isAutoTimeOn": number,      // 是否自動啟用時間
      "isAutoOrderOn": number,     // 是否自動啟用訂單
      "isAutoProductTypeOn": number, // 是否自動啟用商品類型
      "isAutoProductOn": number,   // 是否自動啟用商品
      "kdsDiningType": number,     // 餐別ID
      "kdsStoreArea": number,      // 門店區域ID
      "kdsDisplayTypeId": number,  // 顯示類型ID
      "isNoDisplay": number,       // 是否不顯示
      "isOvertimeNotify": number,  // 是否逾時通知
      "isCookingNotify": number,   // 是否烹調通知
      "isMealSound": number,       // 是否用餐音效
      "isUrgingSound": number,     // 是否催促音效
      "overtimeNotifyMin": number, // 逾時通知分鐘數
      "cookingNotifyMin": number,  // 烹調通知分鐘數
      "isAllProduct": number,      // 是否包含全部商品
      "progressiveTypeId": number, // 漸進型態ID
      "autoTimeOnMin": number,     // 自動啟用時間分鐘數
      "autoOrderOnQty": number,    // 自動啟用訂單數量
      "nextWorkstationId": number, // 下一工作站ID
      "isFirstStation": number,    // 是否首站
      "isGoOn": number,            // 是否繼續
      "prevWorkstationId": number | null, // 前工作站ID
      "dineOver": number,          // 用餐結束
      "taskTime": number,          // 任務時間
      "displayType": number,       // 顯示類型
      "cardType": number           // 卡片類型
    }
  ]
}
```

### 2. 主頁面 (`src/app/main/page.tsx`)
- 更新了工作站介面，符合 KDS API 規格
- 新增了工作站清單狀態管理
- 新增了 `fetchWorkstations` 函數來調用 API
- 在頁面載入時自動獲取工作站清單
- 將工作站清單傳遞給 `LeftSidebar` 組件
- 更新了 API 回應處理邏輯，使用 `code === '0000'` 判斷成功

### 3. 左側邊欄組件 (`src/components/WorkstationBoard/LeftSidebar.tsx`)
- 更新了組件介面，新增工作站相關的 props
- 更新了工作站介面，符合 KDS API 規格
- 移除了寫死的工作站清單
- 改為使用動態獲取的工作站資料
- 新增了載入狀態和錯誤處理的顯示
- 使用 `station.uid` 作為 key 值

## 使用方式

### 1. 調用 API
```typescript
// 獲取店代碼為 1 的工作站清單
const response = await fetch('/api/main?storeId=1');
const result = await response.json();

if (result.code === '0000' && result.data) {
  const workstations = result.data;
  // 使用工作站資料
}
```

### 2. 設定店代碼
目前 `main/page.tsx` 中硬編碼了 `storeId = 1`，實際應用中可以：
- 從環境變數讀取
- 從 localStorage 讀取
- 從登入後的用戶資訊中獲取
- 從 URL 參數中獲取

### 3. 工作站狀態判斷
```typescript
// 判斷工作站是否啟用
const isActive = workstation.isOn === 1;

// 判斷是否為預設工作站
const isDefault = workstation.isDefault === 1;

// 判斷是否為首站
const isFirst = workstation.isFirstStation === 1;
```

## 測試

### 1. 使用測試頁面
更新了 `test-api.html` 測試頁面，包含：
- API 規格說明
- 正常調用測試
- 缺少 storeId 參數測試
- 無效的 storeId 參數測試
- 工作站清單的視覺化顯示

### 2. 測試步驟
1. 啟動開發伺服器：`npm run dev`
2. 在瀏覽器中打開 `test-api.html`
3. 點擊測試按鈕驗證 API 功能
4. 查看工作站清單的詳細資訊

## 資料處理邏輯

### 1. 工作站過濾
- 只回傳啟用狀態的工作站 (`isOn === 1`)
- 排除停用的工作站 (`isDisabled === 0`)
- 根據 `storeId` 過濾對應門店的工作站

### 2. 工作站排序
- 根據 `serialNo` 欄位進行排序
- 確保工作站按照正確的順序顯示

### 3. 預設工作站處理
- 自動選擇第一個工作站作為預設選擇
- 支援 `isDefault` 標記的預設工作站

## 未來擴展

### 1. 資料庫整合
目前使用模擬資料，未來可以：
- 整合 MySQL 或其他資料庫
- 根據 storeId 查詢對應店鋪的工作站
- 實現工作站的增刪改查功能

### 2. 工作站流程管理
- 利用 `nextWorkstationId` 和 `prevWorkstationId` 實現工作站流程
- 支援 `isFirstStation` 和 `isGoOn` 的工作站狀態管理

### 3. 自動化功能
- 實現 `isAutoTimeOn` 的自動時間啟用
- 實現 `isAutoOrderOn` 的自動訂單啟用
- 支援 `autoTimeOnMin` 和 `autoOrderOnQty` 的配置

### 4. 通知和音效
- 實現 `isOvertimeNotify` 的逾時通知
- 實現 `isCookingNotify` 的烹調通知
- 支援 `isMealSound` 和 `isUrgingSound` 的音效控制

## 注意事項

1. **錯誤處理**：API 調用失敗時會顯示錯誤訊息，不會影響頁面其他功能
2. **載入狀態**：API 調用期間會顯示載入狀態，提升用戶體驗
3. **向後相容**：如果 API 調用失敗，工作站按鈕會顯示錯誤狀態，但不會崩潰
4. **類型安全**：使用 TypeScript 介面確保資料類型的一致性
5. **API 規格符合性**：完全符合 A01-GET-KDS工作站 的規格要求

## 檔案結構
```
src/
├── app/
│   ├── api/
│   │   └── main/
│   │       └── route.ts          # KDS 工作站 API 端點
│   └── main/
│       └── page.tsx              # 主頁面，整合 API 調用
└── components/
    └── WorkstationBoard/
        └── LeftSidebar.tsx       # 左側邊欄，使用動態工作站資料
```

## 總結
本次修改成功實現了工作站清單的動態化，並且完全符合 A01-GET-KDS工作站 的 API 規格要求。通過標準化的 API 方式獲取資料，使得工作站配置更加靈活，為未來的功能擴展奠定了堅實的基礎。新的實現支援完整的工作站屬性、流程管理和自動化配置，大大提升了系統的可維護性和擴展性。
