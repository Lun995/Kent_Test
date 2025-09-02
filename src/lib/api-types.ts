// API 回應的標準格式
export interface ApiResponse<T> {
  message: string;      // 回應訊息
  code: string;         // 回應代碼 (0000: 成功, 9999: 失敗)
  data: T | null;      // 回應資料
  timestamp: string;    // 回應時間戳
  requestId?: string;   // 請求識別碼 (可選)
}

// 分頁資訊
export interface PaginationInfo {
  page: number;         // 當前頁碼
  pageSize: number;     // 每頁大小
  total: number;        // 總數量
  totalPages: number;   // 總頁數
}

// 分頁回應
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

// 品項相關的 API 類型
export interface ApiOrderItem {
  id: string;           // 品項唯一識別碼
  name: string;         // 品項名稱
  count: number;        // 數量
  table: string;        // 桌號
  note?: string;        // 備註
  status: 'waiting' | 'making' | 'hold' | 'completed'; // 品項狀態
  priority: number;     // 優先級 (1-10, 1最高)
  createdAt: string;    // 建立時間
  updatedAt: string;    // 更新時間
  estimatedTime?: number; // 預估製作時間 (分鐘)
  actualTime?: number;    // 實際製作時間 (分鐘)
  workstationId?: number; // 工作站ID
  userId?: string;      // 操作員ID
}

// 分類品項類型 (用於 API 回應)
export interface CategoryItems {
  making: ApiOrderItem[];  // 製作中品項
  hold: ApiOrderItem[];    // 暫停品項
  waiting: ApiOrderItem[]; // 待製作品項
}

// 牌卡相關的 API 類型
export interface ApiCardData {
  cardId: string;       // 牌卡唯一識別碼
  cardNumber: number;   // 牌卡編號
  tableName: string;    // 桌號
  status: 'waiting' | 'making' | 'hold' | 'completed'; // 牌卡狀態
  priority: number;     // 優先級
  items: ApiOrderItem[]; // 品項列表
  createdAt: string;    // 建立時間
  updatedAt: string;    // 更新時間
  estimatedCompletionTime?: string; // 預估完成時間
  actualCompletionTime?: string;    // 實際完成時間
  notes?: string;       // 牌卡備註
  customerInfo?: {      // 客戶資訊
    name?: string;
    phone?: string;
    specialRequests?: string;
  };
}

// 工作站相關的 API 類型
export interface ApiWorkstation {
  uid: number;          // 工作站唯一識別碼
  no: string;           // 工作站編號
  name: string;         // 工作站名稱
  brandId: number;      // 品牌ID
  storeId: number;      // 門市ID
  isOn: number;         // 是否啟用
  serialNo: number;     // 序號
  memo: string;         // 備註
  status: number;       // 狀態
  isDefault: number;    // 是否為預設工作站
  currentItems?: ApiOrderItem[]; // 當前處理的品項
  capacity: number;     // 工作站容量
  efficiency: number;   // 工作效率 (1-100)
}

// 門市相關的 API 類型
export interface ApiStore {
  id: number;           // 門市唯一識別碼
  name: string;         // 門市名稱
  code: string;         // 門市代碼
  address: string;      // 門市地址
  phone: string;        // 門市電話
  status: 'active' | 'inactive'; // 門市狀態
  timezone: string;     // 時區
  businessHours: {      // 營業時間
    open: string;
    close: string;
  };
  workstations: ApiWorkstation[]; // 工作站列表
}

// 品項狀態變更的 API 請求
export interface UpdateItemStatusRequest {
  itemId: string;       // 品項ID
  newStatus: 'waiting' | 'making' | 'hold' | 'completed';
  workstationId?: number; // 工作站ID
  userId?: string;      // 操作員ID
  notes?: string;       // 操作備註
}

// 牌卡狀態變更的 API 請求
export interface UpdateCardStatusRequest {
  cardId: string;       // 牌卡ID
  newStatus: 'waiting' | 'making' | 'hold' | 'completed';
  workstationId?: number; // 工作站ID
  userId?: string;      // 操作員ID
  notes?: string;       // 操作備註
}

// 品項移動的 API 請求
export interface MoveItemRequest {
  itemId: string;       // 品項ID
  fromStatus: 'waiting' | 'making' | 'hold' | 'completed';
  toStatus: 'waiting' | 'making' | 'hold' | 'completed';
  workstationId?: number; // 目標工作站ID
  userId?: string;      // 操作員ID
  notes?: string;       // 移動原因
}

// 批量操作的 API 請求
export interface BatchOperationRequest {
  operation: 'move' | 'update' | 'delete';
  itemIds: string[];    // 品項ID列表
  targetStatus?: 'waiting' | 'making' | 'hold' | 'completed';
  targetWorkstationId?: number;
  userId?: string;      // 操作員ID
  notes?: string;       // 操作備註
}

// 搜尋和篩選的 API 請求
export interface SearchItemsRequest {
  query?: string;       // 搜尋關鍵字
  status?: 'waiting' | 'making' | 'hold' | 'completed';
  tableName?: string;   // 桌號篩選
  workstationId?: number; // 工作站篩選
  dateRange?: {         // 日期範圍
    start: string;
    end: string;
  };
  priority?: number;    // 優先級篩選
  page: number;         // 頁碼
  pageSize: number;     // 每頁大小
}

// 統計資訊的 API 回應
export interface StatisticsResponse {
  totalItems: number;   // 總品項數
  waitingItems: number; // 待製作品項數
  makingItems: number;  // 製作中品項數
  holdItems: number;    // 暫停品項數
  completedItems: number; // 已完成品項數
  averageCompletionTime: number; // 平均完成時間 (分鐘)
  workstationUtilization: {      // 工作站使用率
    [workstationId: number]: number;
  };
  dailyStats: {         // 每日統計
    date: string;
    completed: number;
    total: number;
  }[];
}

// 錯誤回應格式
export interface ApiErrorResponse {
  message: string;      // 錯誤訊息
  code: string;         // 錯誤代碼
  details?: string;     // 詳細錯誤資訊
  timestamp: string;    // 錯誤時間戳
  requestId?: string;   // 請求識別碼
  field?: string;       // 錯誤欄位 (驗證錯誤時)
}

// 成功回應格式
export interface ApiSuccessResponse<T> {
  message: string;      // 成功訊息
  code: '0000';        // 成功代碼
  data: T;             // 回應資料
  timestamp: string;    // 回應時間戳
  requestId?: string;   // 請求識別碼
}
