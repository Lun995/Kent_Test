/**
 * API 相關的類型定義
 * 定義所有 API 請求、回應、錯誤等相關的介面和類型
 */

// ==================== 基礎 API 回應格式 ====================

/**
 * 標準 API 回應介面
 * 所有 API 回應都遵循此格式
 */
export interface ApiResponse<T = any> {
  message: string;           // 回應訊息
  code: string;              // 回應代碼 (0000: 成功, 9999: 失敗)
  data: T | null;            // 回應資料
  error?: string;            // 錯誤訊息（失敗時）
  timestamp?: string;        // 回應時間戳
  requestId?: string;        // 請求 ID（用於追蹤）
}

/**
 * 分頁回應介面
 * 用於需要分頁的 API 回應
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;            // 當前頁碼
    limit: number;           // 每頁數量
    total: number;           // 總數量
    totalPages: number;      // 總頁數
    hasNext: boolean;        // 是否有下一頁
    hasPrev: boolean;        // 是否有上一頁
  };
}

/**
 * 分頁請求參數
 */
export interface PaginationParams {
  page?: number;             // 頁碼（從 1 開始）
  limit?: number;            // 每頁數量
  sortBy?: string;           // 排序欄位
  sortOrder?: 'asc' | 'desc'; // 排序方向
}

// ==================== 錯誤相關類型 ====================

/**
 * API 錯誤代碼枚舉
 */
export enum ApiErrorCode {
  SUCCESS = '0000',          // 成功
  VALIDATION_ERROR = '1000', // 驗證錯誤
  AUTHENTICATION_ERROR = '2000', // 認證錯誤
  AUTHORIZATION_ERROR = '2001', // 授權錯誤
  NOT_FOUND = '3000',        // 資源不存在
  CONFLICT = '4000',         // 資源衝突
  INTERNAL_ERROR = '9999',   // 內部錯誤
  NETWORK_ERROR = '5000',    // 網路錯誤
  TIMEOUT_ERROR = '5001',    // 超時錯誤
  RATE_LIMIT_ERROR = '5002', // 速率限制錯誤
}

/**
 * API 錯誤介面
 */
export interface ApiError {
  code: ApiErrorCode;        // 錯誤代碼
  message: string;           // 錯誤訊息
  details?: any;             // 詳細錯誤資訊
  field?: string;            // 錯誤欄位（驗證錯誤時）
}

// ==================== 工作站相關類型 ====================

/**
 * KDS 工作站介面
 * 根據 A01-GET-KDS工作站 API 規格定義
 */
export interface KdsWorkstation {
  uid: number;                    // 唯一識別碼
  no: string;                     // 工作站編號
  name: string;                   // 工作站名稱
  brandId: number;                // 品牌ID
  storeId: number;                // 門店ID
  isOn: number;                   // 是否啟用 (1: 啟用, 0: 停用)
  serialNo: number;               // 排序序號
  memo: string;                   // 備註說明
  creatorId: number;              // 建立者ID
  createDate: string;             // 建立時間
  modifyId: number;               // 修改者ID
  modifyDate: string;             // 修改時間
  isDisabled: number;             // 是否停用 (0: 正常, 1: 停用)
  status: number;                 // 狀態碼
  companyId: number;              // 公司ID
  isDefault: number;              // 是否為預設工作站 (1: 是, 0: 否)
  isAutoTimeOn: number;           // 是否自動啟用時間 (1: 是, 0: 否)
  isAutoOrderOn: number;          // 是否自動啟用訂單 (1: 是, 0: 否)
  isAutoProductTypeOn: number;    // 是否自動啟用商品類型 (1: 是, 0: 否)
  isAutoProductOn: number;        // 是否自動啟用商品 (1: 是, 0: 否)
  kdsDiningType: number;          // 餐別ID
  kdsStoreArea: number;           // 門店區域ID
  kdsDisplayTypeId: number;       // 顯示類型ID
  isNoDisplay: number;            // 是否不顯示 (1: 是, 0: 否)
  isOvertimeNotify: number;       // 是否逾時通知 (1: 是, 0: 否)
  isCookingNotify: number;        // 是否烹調通知 (1: 是, 0: 否)
  isMealSound: number;            // 是否用餐音效 (1: 是, 0: 否)
  isUrgingSound: number;          // 是否催促音效 (1: 是, 0: 否)
  overtimeNotifyMin: number;      // 逾時通知分鐘數
  cookingNotifyMin: number;       // 烹調通知分鐘數
  isAllProduct: number;           // 是否包含全部商品 (1: 是, 0: 否)
  progressiveTypeId: number;      // 漸進型態ID
  autoTimeOnMin: number;          // 自動啟用時間分鐘數
  autoOrderOnQty: number;         // 自動啟用訂單數量
  nextWorkstationId: number;      // 下一工作站ID
  isFirstStation: number;         // 是否為首站 (1: 是, 0: 否)
  isGoOn: number;                 // 是否繼續 (1: 是, 0: 否)
  prevWorkstationId: number | null; // 前工作站ID
  dineOver: number;               // 用餐結束 (1: 是, 0: 否)
  taskTime: number;               // 任務時間（分鐘）
  displayType: number;            // 顯示類型
  cardType: number;               // 卡片類型
}

/**
 * 工作站回應類型
 */
export type KdsWorkstationResponse = ApiResponse<KdsWorkstation[]>;

/**
 * 工作站查詢參數
 */
export interface WorkstationQueryParams extends PaginationParams {
  storeId: number;                // 門店ID（必填）
  brandId?: number;               // 品牌ID
  isOn?: number;                  // 啟用狀態
  isDisabled?: number;            // 停用狀態
  status?: number;                // 狀態碼
  search?: string;                // 搜尋關鍵字（工作站名稱或編號）
}

// ==================== 訂單相關類型 ====================

/**
 * 訂單狀態枚舉
 */
export enum OrderStatus {
  PENDING = 'pending',            // 待處理
  PREPARING = 'preparing',        // 製作中
  READY = 'ready',                // 準備完成
  COMPLETED = 'completed',        // 已完成
  CANCELLED = 'cancelled',        // 已取消
  ON_HOLD = 'on_hold',           // 暫停
}

/**
 * 訂單介面
 */
export interface Order {
  id: string;                     // 訂單ID
  orderNumber: string;            // 訂單編號
  customerName: string;           // 客戶姓名
  items: OrderItem[];             // 訂單項目
  status: OrderStatus;            // 訂單狀態
  totalAmount: number;            // 總金額
  createdAt: string;              // 建立時間
  updatedAt: string;              // 更新時間
  workstationId?: number;         // 工作站ID
  estimatedTime?: number;         // 預估完成時間（分鐘）
  notes?: string;                 // 備註
}

/**
 * 訂單項目介面
 */
export interface OrderItem {
  id: string;                     // 項目ID
  productId: string;              // 產品ID
  productName: string;            // 產品名稱
  quantity: number;               // 數量
  unitPrice: number;              // 單價
  totalPrice: number;             // 總價
  specialInstructions?: string;   // 特殊要求
  isCompleted: boolean;           // 是否完成
}

/**
 * 訂單查詢參數
 */
export interface OrderQueryParams extends PaginationParams {
  status?: OrderStatus;           // 訂單狀態
  workstationId?: number;         // 工作站ID
  customerName?: string;          // 客戶姓名
  startDate?: string;             // 開始日期
  endDate?: string;               // 結束日期
  minAmount?: number;             // 最小金額
  maxAmount?: number;             // 最大金額
}

/**
 * 訂單回應類型
 */
export type OrderResponse = ApiResponse<Order>;
export type OrdersResponse = PaginatedResponse<Order>;

// ==================== 用戶相關類型 ====================

/**
 * 用戶角色枚舉
 */
export enum UserRole {
  ADMIN = 'admin',                // 管理員
  MANAGER = 'manager',            // 經理
  STAFF = 'staff',                // 員工
  VIEWER = 'viewer',              // 檢視者
}

/**
 * 用戶介面
 */
export interface User {
  id: string;                     // 用戶ID
  username: string;               // 用戶名
  email: string;                  // 電子郵件
  role: UserRole;                 // 用戶角色
  firstName: string;              // 名字
  lastName: string;               // 姓氏
  isActive: boolean;              // 是否啟用
  lastLoginAt?: string;           // 最後登入時間
  createdAt: string;              // 建立時間
  updatedAt: string;              // 更新時間
}

/**
 * 登入請求介面
 */
export interface LoginRequest {
  username: string;               // 用戶名
  password: string;               // 密碼
  rememberMe?: boolean;           // 記住我
}

/**
 * 登入回應介面
 */
export interface LoginResponse {
  user: User;                     // 用戶資訊
  token: string;                  // JWT Token
  refreshToken: string;           // 刷新 Token
  expiresIn: number;              // 過期時間（秒）
}

/**
 * 用戶回應類型
 */
export type UserResponse = ApiResponse<User>;
export type UsersResponse = PaginatedResponse<User>;

// ==================== 通用類型 ====================

/**
 * 選擇選項介面
 */
export interface SelectOption<T = string | number> {
  value: T;                       // 選項值
  label: string;                  // 選項標籤
  disabled?: boolean;             // 是否禁用
}

/**
 * 檔案上傳回應
 */
export interface FileUploadResponse {
  filename: string;               // 檔案名稱
  url: string;                    // 檔案URL
  size: number;                   // 檔案大小（位元組）
  mimeType: string;               // MIME 類型
}

/**
 * 批量操作請求
 */
export interface BatchOperationRequest<T> {
  ids: string[] | number[];       // 操作對象ID列表
  operation: string;              // 操作類型
  data?: Partial<T>;              // 操作資料
}

/**
 * 批量操作回應
 */
export interface BatchOperationResponse {
  successCount: number;           // 成功數量
  failureCount: number;           // 失敗數量
  errors: Array<{
    id: string | number;          // 失敗的ID
    error: string;                // 錯誤訊息
  }>;
}

// ==================== 工具類型 ====================

/**
 * 將物件轉換為查詢字串
 */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * 可選欄位類型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 必需欄位類型
 */
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 深度部分類型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
